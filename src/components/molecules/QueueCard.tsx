/**
 * QueueCard Molecule Component
 * 
 * Purpose: Display queue entry details
 * Combines: Card + Text + Badge
 */

'use client';

import React from 'react';
import { Card } from './Card';
import { Text } from '../atoms/Text';
import { Badge } from '../atoms/Badge';
import type { QueueEntry } from '@/types/domain.types';

export interface QueueCardProps {
  entry: QueueEntry;
  showService?: boolean;
}

const statusVariants: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  WAITING: 'info',
  CALLED: 'warning',
  IN_SERVICE: 'success',
  COMPLETED: 'success',
  NO_SHOW: 'error',
  LEFT: 'neutral',
};

const priorityVariants: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  HIGH: 'error',
  NORMAL: 'neutral',
};

export function QueueCard({ entry, showService = true }: QueueCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div>
          <Text variant="h3" className="mb-1">
            Position #{entry.position}
          </Text>
          {showService && (
            <Text variant="small" className="text-gray-500">
              {entry.service.name}
            </Text>
          )}
        </div>
        <div className="flex gap-2">
          <Badge variant={priorityVariants[entry.priority]}>
            {entry.priority}
          </Badge>
          <Badge variant={statusVariants[entry.status]}>
            {entry.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
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
          <Text variant="small">{entry.customer.name}</Text>
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <Text variant="small">
            Joined at{' '}
            {new Date(entry.joinedAt).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </div>

        {entry.estimatedWaitTime && (
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
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
            <Text variant="small">
              Estimated wait: {entry.estimatedWaitTime} min
            </Text>
          </div>
        )}
      </div>
    </Card>
  );
}
