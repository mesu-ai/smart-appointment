/**
 * Appointment Detail API Routes
 * 
 * GET /api/appointments/:id - Get appointment details
 * PATCH /api/appointments/:id - Update appointment
 * DELETE /api/appointments/:id - Cancel appointment
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateOrThrow } from '@/lib/validation/validators/validate';
import { UpdateAppointmentSchema } from '@/lib/validation/schemas/appointment.schema';
import { getCurrentUser } from '@/lib/auth/session';
import { 
  findAppointmentById, 
  updateAppointment,
  updateAppointmentStatus,
} from '@/lib/db/models/appointment.model';
import { handleError } from '@/lib/utils/error.utils';
import { ResourceNotFoundError, DomainInvariantViolationError } from '@/types/error.types';
import type { UpdateAppointmentResponse } from '@/types/api.types';
import type { AppointmentStatus } from '@/types/domain.types';

/**
 * GET /api/appointments/:id
 * 
 * Get appointment by ID.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const appointment = await findAppointmentById(id);

    if (!appointment) {
      throw new ResourceNotFoundError(
        'Appointment not found',
        'Appointment',
        id
      );
    }

    // Check ownership or staff access
    const isOwner = appointment.customerInfo.email === user.email;
    const isStaff = user.role === 'STAFF' || user.role === 'ADMIN';
    
    if (!isOwner && !isStaff) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ appointment }, { status: 200 });

  } catch (error) {
    return handleError(error);
  }
}

/**
 * PATCH /api/appointments/:id
 * 
 * Update appointment status or notes.
 * Enforces valid status transitions as domain invariant.
 * 
 * Valid status transitions:
 * - SCHEDULED → CONFIRMED, CANCELLED
 * - CONFIRMED → IN_PROGRESS, NO_SHOW, CANCELLED
 * - IN_PROGRESS → COMPLETED
 * - COMPLETED → (no transitions allowed)
 * - CANCELLED → (no transitions allowed)
 * - NO_SHOW → (no transitions allowed)
 */
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Require staff authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'STAFF' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 });
    }

    // ============================================
    // STEP 1: Validate request body
    // ============================================
    const body = await _request.json();
    const validatedData = validateOrThrow(UpdateAppointmentSchema, body);

    // ============================================
    // STEP 2: Get current appointment
    // ============================================
    const { id } = await params;
    const currentAppointment = await findAppointmentById(id);

    if (!currentAppointment) {
      throw new ResourceNotFoundError(
        'Appointment not found',
        'Appointment',
        id
      );
    }

    // ============================================
    // STEP 3: Validate status transition (Domain Invariant)
    // ============================================
    if (validatedData.status) {
      const validTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
        SCHEDULED: ['CONFIRMED', 'CANCELLED'],
        CONFIRMED: ['IN_PROGRESS', 'NO_SHOW', 'CANCELLED'],
        IN_PROGRESS: ['COMPLETED'],
        COMPLETED: [],
        CANCELLED: [],
        NO_SHOW: [],
      };

      const allowedTransitions = validTransitions[currentAppointment.status];
      
      if (!allowedTransitions.includes(validatedData.status)) {
        throw new DomainInvariantViolationError(
          `Invalid status transition: ${currentAppointment.status} → ${validatedData.status}`,
          'AppointmentStatusTransition'
        );
      }
    }

    // ============================================
    // STEP 4: Update appointment
    // ============================================
    let updatedAppointment;

    if (validatedData.status) {
      updatedAppointment = await updateAppointmentStatus(id, validatedData.status);
    }

    if (validatedData.notes !== undefined) {
      updatedAppointment = await updateAppointment(id, {
        $set: { notes: validatedData.notes },
      });
    }

    if (!updatedAppointment) {
      throw new Error('Failed to update appointment');
    }

    // ============================================
    // STEP 5: Return response
    // ============================================
    const response: UpdateAppointmentResponse = {
      appointment: updatedAppointment,
      message: 'Appointment updated successfully',
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/appointments/:id
 * 
 * Cancel (soft delete) an appointment by setting status to CANCELLED.
 * Does not actually delete the record for audit purposes.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ============================================
    // STEP 1: Get current appointment
    // ============================================
    const { id } = await params;
    const appointment = await findAppointmentById(id);

    if (!appointment) {
      throw new ResourceNotFoundError(
        'Appointment not found',
        'Appointment',
        id
      );
    }

    // Check ownership or staff access
    const isOwner = appointment.customerInfo.email === user.email;
    const isStaff = user.role === 'STAFF' || user.role === 'ADMIN';
    
    if (!isOwner && !isStaff) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ============================================
    // STEP 2: Check if already cancelled or completed
    // ============================================
    if (appointment.status === 'CANCELLED') {
      return NextResponse.json(
        { message: 'Appointment is already cancelled' },
        { status: 200 }
      );
    }

    if (appointment.status === 'COMPLETED') {
      throw new DomainInvariantViolationError(
        'Cannot cancel a completed appointment',
        'AppointmentCancellation'
      );
    }

    // ============================================
    // STEP 3: Update status to CANCELLED
    // ============================================
    const updatedAppointment = await updateAppointmentStatus(id, 'CANCELLED');

    if (!updatedAppointment) {
      throw new Error('Failed to cancel appointment');
    }

    // ============================================
    // STEP 4: Return response
    // ============================================
    return NextResponse.json(
      {
        appointment: updatedAppointment,
        message: 'Appointment cancelled successfully',
      },
      { status: 200 }
    );

  } catch (error) {
    return handleError(error);
  }
}
