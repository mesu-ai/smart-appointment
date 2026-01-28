/**
 * AppointmentList Organism Component
 * 
 * Purpose: Display list of appointments with filtering
 * Combines: Multiple AppointmentCards + EmptyState + Spinner
 */

'use client';

import { AppointmentCard } from '../molecules/AppointmentCard';
import { EmptyState } from '../molecules/EmptyState';
import { Spinner } from '../atoms/Spinner';
import type { Appointment } from '@/types/domain.types';

export interface AppointmentListProps {
  appointments: Appointment[];
  isLoading?: boolean;
  onCancel?: (id: string) => void;
  onReschedule?: (id: string) => void;
  emptyMessage?: string;
}

export function AppointmentList({
  appointments,
  isLoading = false,
  onCancel,
  onReschedule,
  emptyMessage = 'No appointments found',
}: AppointmentListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <EmptyState
        title={emptyMessage}
        description="Your appointments will appear here once you book them."
      />
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          onCancel={onCancel}
          onReschedule={onReschedule}
        />
      ))}
    </div>
  );
}
