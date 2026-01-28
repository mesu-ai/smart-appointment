/**
 * AppointmentCard Molecule Component
 * 
 * Purpose: Display appointment details
 * Combines: Card + Text + Badge + Button
 */

'use client';

import { Card } from './Card';
import { Text } from '../atoms/Text';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import type { Appointment } from '@/types/domain.types';

export interface AppointmentCardProps {
  appointment: Appointment;
  onCancel?: (id: string) => void;
  onReschedule?: (id: string) => void;
  showActions?: boolean;
}

const statusVariants: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  SCHEDULED: 'info',
  CONFIRMED: 'success',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'error',
  NO_SHOW: 'error',
};

export function AppointmentCard({
  appointment,
  onCancel,
  onReschedule,
  showActions = true,
}: AppointmentCardProps) {
  const canCancel = ['SCHEDULED', 'CONFIRMED'].includes(appointment.status);

  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div>
          <Text variant="h3" className="mb-1">
            {appointment.serviceName}
          </Text>
          <Text variant="small" className="text-gray-500">
            {new Date(appointment.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </div>
        <Badge variant={statusVariants[appointment.status]}>
          {appointment.status.replace('_', ' ')}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm">
          <svg
            className="w-4 h-4 mr-2 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <Text variant="small">
            {appointment.timeSlot.startTime} - {appointment.timeSlot.endTime}
          </Text>
        </div>

        <div className="flex items-center text-sm">
          <svg
            className="w-4 h-4 mr-2 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <Text variant="small">{appointment.customerInfo.name}</Text>
        </div>

        <div className="flex items-center text-sm">
          <svg
            className="w-4 h-4 mr-2 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <Text variant="small">{appointment.customerInfo.email}</Text>
        </div>
      </div>

      {showActions && canCancel && (
        <div className="flex gap-2">
          {onReschedule && (
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={() => onReschedule(appointment.id)}
            >
              Reschedule
            </Button>
          )}
          {onCancel && (
            <Button
              variant="danger"
              size="sm"
              fullWidth
              onClick={() => onCancel(appointment.id)}
            >
              Cancel
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
