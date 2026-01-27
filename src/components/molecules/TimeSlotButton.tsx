/**
 * TimeSlotButton Molecule Component
 * 
 * Purpose: Selectable time slot button
 * Combines: Button + Time display + Available state
 */

'use client';

import React from 'react';

export interface TimeSlot {
  start: string; // HH:MM format
  end: string;
  isAvailable: boolean;
}

export interface TimeSlotButtonProps {
  slot: TimeSlot;
  selected?: boolean;
  onSelect?: (slot: TimeSlot) => void;
}

export function TimeSlotButton({ slot, selected = false, onSelect }: TimeSlotButtonProps) {
  if (!slot.isAvailable) {
    return (
      <button
        disabled
        className="px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
      >
        <div className="text-sm font-medium">{slot.start}</div>
        <div className="text-xs">Unavailable</div>
      </button>
    );
  }

  return (
    <button
      onClick={() => onSelect?.(slot)}
      className={`
        px-4 py-3 border rounded-lg transition-all
        ${
          selected
            ? 'border-blue-500 bg-blue-50 text-blue-700'
            : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
        }
      `}
    >
      <div className="text-sm font-medium">{slot.start}</div>
      <div className="text-xs text-gray-500">{slot.end}</div>
    </button>
  );
}
