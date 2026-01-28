'use client';

import { TimeSlotButton, type TimeSlot } from '../molecules/TimeSlotButton';
import { Input } from '../atoms/Input';
import { Text } from '../atoms/Text';
import { Spinner } from '../atoms/Spinner';
import { EmptyState } from '../molecules/EmptyState';

export interface TimeSlotPickerProps {
  selectedDate: string;
  selectedSlot?: TimeSlot;
  onDateChange: (date: string) => void;
  onSlotSelect: (slot: TimeSlot) => void;
  slots: TimeSlot[];
  isLoading?: boolean;
}

export function TimeSlotPicker({
  selectedDate,
  selectedSlot,
  onDateChange,
  onSlotSelect,
  slots,
  isLoading = false,
}: TimeSlotPickerProps) {
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 90);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div>
        <Text variant="h3" className="mb-4">
          Select Date & Time
        </Text>
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          min={today}
          max={maxDateStr}
          label="Appointment Date"
        />
      </div>

      {selectedDate && (
        <div>
          <Text variant="body" className="mb-3 font-medium">
            Available Time Slots
          </Text>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="md" />
            </div>
          ) : slots.length === 0 ? (
            <EmptyState
              title="No available slots"
              description="Please select a different date."
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {slots.map((slot) => (
                <TimeSlotButton
                  key={`${slot.startTime}-${slot.endTime}`}
                  slot={slot}
                  selected={
                    selectedSlot?.startTime === slot.startTime &&
                    selectedSlot?.endTime === slot.endTime
                  }
                  onSelect={onSlotSelect}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
