/**
 * Book Appointment Page (New Implementation)
 * 
 * Purpose: Multi-step booking wizard page with React Query integration
 */

'use client';

import React from 'react';
import { NavigationBar } from '@/components/organisms/NavigationBar';
import { BookingWizard } from '@/components/organisms/BookingWizard';

export default function BookAppointmentNew() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BookingWizard />
      </main>
    </div>
  );
}
