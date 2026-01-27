/**
 * Available Time Slots API
 * 
 * GET /api/services/:id/slots - Get available time slots for a service on a specific date
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateOrThrow } from '@/lib/validation/validators/validate';
import { DateStringSchema } from '@/lib/validation/schemas/value-objects.schema';
import { findServiceById, getServiceBusinessHours } from '@/lib/db/models/service.model';
import { findAppointments } from '@/lib/db/models/appointment.model';
import { generateTimeSlots, timeSlotsOverlap } from '@/lib/utils/time.utils';
import { handleError } from '@/lib/utils/error.utils';
import { ResourceNotFoundError } from '@/types/error.types';
import type { GetAvailableSlotsResponse } from '@/types/api.types';
import type { TimeSlot } from '@/types/domain.types';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/services/:id/slots?date=YYYY-MM-DD
 * 
 * Get available time slots for a service on a specific date.
 * 
 * Query parameters:
 * - date (required): Date in YYYY-MM-DD format
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // ============================================
    // STEP 1: Validate query parameters
    // ============================================
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get('date');

    if (!dateParam) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    const validatedDate = validateOrThrow(DateStringSchema, dateParam);

    // ============================================
    // STEP 2: Get service
    // ============================================
    const service = await findServiceById(params.id);

    if (!service) {
      throw new ResourceNotFoundError(
        'Service not found',
        'Service',
        params.id
      );
    }

    // ============================================
    // STEP 3: Get business hours for the date
    // ============================================
    const date = new Date(validatedDate);
    const dayOfWeek = date.getDay();
    
    const businessHours = await getServiceBusinessHours(params.id, dayOfWeek);

    if (!businessHours || !businessHours.isOpen) {
      // Closed on this day
      const response: GetAvailableSlotsResponse = {
        slots: [],
        date: validatedDate,
      };
      return NextResponse.json(response, { status: 200 });
    }

    // ============================================
    // STEP 4: Generate all possible time slots
    // ============================================
    const allSlots = generateTimeSlots(
      businessHours.openTime,
      businessHours.closeTime,
      service.duration
    );

    // ============================================
    // STEP 5: Get existing appointments for this date
    // ============================================
    const existingAppointments = await findAppointments({
      serviceId: params.id,
      date: validatedDate,
      status: { $nin: ['CANCELLED', 'NO_SHOW'] },
    });

    // ============================================
    // STEP 6: Mark slots as available/unavailable
    // ============================================
    const slotsWithAvailability = allSlots.map((slot) => {
      const isBooked = existingAppointments.some((appointment) => {
        const appointmentSlot: TimeSlot = {
          startTime: appointment.timeSlot.startTime,
          endTime: appointment.timeSlot.endTime,
        };
        return timeSlotsOverlap(slot, appointmentSlot);
      });

      return {
        startTime: slot.startTime,
        endTime: slot.endTime,
        available: !isBooked,
      };
    });

    // ============================================
    // STEP 7: Return response
    // ============================================
    const response: GetAvailableSlotsResponse = {
      slots: slotsWithAvailability,
      date: validatedDate,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    return handleError(error);
  }
}
