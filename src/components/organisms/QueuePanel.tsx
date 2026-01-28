/**
 * QueuePanel Organism Component
 * 
 * Purpose: Display current queue status
 * Combines: Multiple QueueCards + EmptyState + Spinner
 */

'use client';

import { QueueCard } from '../molecules/QueueCard';
import { EmptyState } from '../molecules/EmptyState';
import { Spinner } from '../atoms/Spinner';
import { Text } from '../atoms/Text';
import type { QueueEntry } from '@/types/domain.types';

export interface QueuePanelProps {
  entries: QueueEntry[];
  isLoading?: boolean;
  currentPosition?: number;
}

export function QueuePanel({ entries, isLoading = false, currentPosition }: QueuePanelProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <EmptyState
        title="Queue is empty"
        description="No one is currently waiting in the queue."
      />
    );
  }

  return (
    <div className="space-y-4">
      {currentPosition !== undefined && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <Text variant="h3" className="text-blue-800">
            Your Position: #{currentPosition}
          </Text>
          <Text variant="small" className="text-blue-600">
            {currentPosition === 1
              ? 'You are next!'
              : `${currentPosition - 1} ${currentPosition === 2 ? 'person' : 'people'} ahead of you`}
          </Text>
        </div>
      )}

      {entries.map((entry) => (
        <QueueCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
