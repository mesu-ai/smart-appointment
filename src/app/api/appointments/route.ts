/**
 * Appointments API Routes
 * 
 * POST /api/appointments - Create new appointment
 * GET /api/appointments - List appointments with optional filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateOrThrow } from '@/lib/validation/validators/validate';
import { CreateAppointmentSchema, ListAppointmentsQuerySchema } from '@/lib/validation/schemas/appointment.schema';
import { RuleEngine } from '@/lib/rules/engine/rule-engine';
import { requireStaff } from '@/lib/auth/session';
import { AdvanceBookingRule } from '@/lib/rules/appointments/advance-booking.rule';
import { BusinessHoursRule } from '@/lib/rules/appointments/business-hours.rule';
import { DuplicateAppointmentRule } from '@/lib/rules/appointments/duplicate-appointment.rule';
import { TimeSlotAvailabilityRule } from '@/lib/rules/appointments/time-slot-availability.rule';
import { DailyCapacityRule } from '@/lib/rules/appointments/daily-capacity.rule';
import { createAppointment, findAppointments } from '@/lib/db/models/appointment.model';
import { findServiceById } from '@/lib/db/models/service.model';
import { createTimeSlotLock } from '@/lib/db/models/time-slot-lock.model';
import { withTransaction } from '@/lib/utils/transaction.utils';
import { handleError } from '@/lib/utils/error.utils';
import { BusinessRuleViolationError, ResourceNotFoundError } from '@/types/error.types';
import type { CreateAppointmentResponse, ListAppointmentsResponse } from '@/types/api.types';
import type { AppointmentBookingContext } from '@/lib/rules/appointments/business-hours.rule';
import { ObjectId } from 'mongodb';
import type { Filter } from 'mongodb';
import type { AppointmentDocument } from '@/types/database.types';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // ============================================
    // STEP 0: Require authentication
    // ============================================
    // const user = await requireAuth();

    // ============================================
    // STEP 1: Parse and validate request body
    // ============================================
    const body = await request.json();
    const validatedData = validateOrThrow(CreateAppointmentSchema, body);

    // ============================================
    // STEP 2: Verify service exists
    // ============================================
    const service = await findServiceById(validatedData.serviceId);
    if (!service) {
      throw new ResourceNotFoundError(
        'Service not found',
        'Service',
        validatedData.serviceId
      );
    }

    // ============================================
    // STEP 3: Execute business rules
    // ============================================
    const ruleEngine = new RuleEngine<AppointmentBookingContext>();
    
    // Register rules in priority order
    ruleEngine.registerRule(new AdvanceBookingRule());
    ruleEngine.registerRule(new BusinessHoursRule());
    ruleEngine.registerRule(new DuplicateAppointmentRule());
    ruleEngine.registerRule(new TimeSlotAvailabilityRule());
    ruleEngine.registerRule(new DailyCapacityRule());

    const ruleContext: AppointmentBookingContext = {
      serviceId: validatedData.serviceId,
      date: new Date(validatedData.date),
      startTime: validatedData.timeSlot.startTime,
      endTime: validatedData.timeSlot.endTime,
      customerEmail: validatedData.customerInfo.email,
    };

    const ruleFailure = await ruleEngine.executeUntilFailure(ruleContext);
    
    if (ruleFailure) {
      throw new BusinessRuleViolationError(
        ruleFailure.errorMessage!,
        ruleFailure.errorCode as any,
        ruleFailure.metadata
      );
    }

    // ============================================
    // STEP 4: Create appointment in transaction
    // ============================================
    const appointment = await withTransaction(async (_session) => {
      // Create appointment
      const newAppointment = await createAppointment({
        serviceId: validatedData.serviceId,
        serviceName: service.name,
        date: new Date(validatedData.date),
        startTime: validatedData.timeSlot.startTime,
        endTime: validatedData.timeSlot.endTime,
        duration: service.duration,
        status: 'SCHEDULED',
        customerName: validatedData.customerInfo.name,
        customerEmail: validatedData.customerInfo.email,
        customerPhone: validatedData.customerInfo.phone,
        notes: validatedData.customerInfo.notes,
      });

      // Create time slot lock to prevent double booking
      await createTimeSlotLock(
        validatedData.serviceId,
        new Date(validatedData.date),
        validatedData.timeSlot.startTime,
        validatedData.timeSlot.endTime,
        new ObjectId(newAppointment.id)
      );

      return newAppointment;
    });

    // ============================================
    // STEP 5: Return success response
    // ============================================
    const response: CreateAppointmentResponse = {
      appointment,
      message: 'Appointment created successfully',
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    return handleError(error);
  }
}

/**
 * GET /api/appointments
 * 
 * List appointments with optional filters.
 * 
 * Query parameters:
 * - serviceId: Filter by service
 * - date: Filter by date (YYYY-MM-DD)
 * - status: Filter by status
 * - customerEmail: Filter by customer email
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // ============================================
    // STEP 0: Require staff authentication
    // ============================================
    await requireStaff();

    // ============================================
    // STEP 1: Parse and validate query parameters
    // ============================================
    const searchParams = request.nextUrl.searchParams;
    const queryParams = {
      serviceId: searchParams.get('serviceId') || undefined,
      date: searchParams.get('date') || undefined,
      status: searchParams.get('status') || undefined,
      customerEmail: searchParams.get('customerEmail') || undefined,
    };

    const validatedQuery = validateOrThrow(ListAppointmentsQuerySchema, queryParams);

    // ============================================
    // STEP 2: Build MongoDB filter
    // ============================================
    const filter: Filter<AppointmentDocument> = {};

    if (validatedQuery.serviceId) {
      filter.serviceId = validatedQuery.serviceId;
    }

    if (validatedQuery.date) {
      filter.date = new Date(validatedQuery.date);
    }

    if (validatedQuery.status) {
      filter.status = validatedQuery.status;
    }

    if (validatedQuery.customerEmail) {
      filter.customerEmail = validatedQuery.customerEmail;
    }

    // ============================================
    // STEP 3: Fetch appointments
    // ============================================
    const appointments = await findAppointments(filter);

    // ============================================
    // STEP 4: Return response
    // ============================================
    const response: ListAppointmentsResponse = {
      appointments,
      total: appointments.length,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    return handleError(error);
  }
}
