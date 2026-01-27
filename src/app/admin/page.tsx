/**
 * Admin Dashboard Page
 * 
 * Purpose: Admin panel for managing appointments and queue
 */

'use client';

import React, { useState } from 'react';
import { NavigationBar } from '@/components/organisms/NavigationBar';
import { AppointmentList } from '@/components/organisms/AppointmentList';
import { QueuePanel } from '@/components/organisms/QueuePanel';
import { Text } from '@/components/atoms/Text';
import { Card } from '@/components/molecules/Card';
import { StatCard } from '@/components/molecules/StatCard';
import { Button } from '@/components/atoms/Button';
import { Select } from '@/components/atoms/Select';
import { useAppointments, useCancelAppointment } from '@/hooks/use-appointments';
import { useQueue, useCallNext } from '@/hooks/use-queue';
import { useToast } from '@/context/toast-context';
import { Users, Settings, Activity, Briefcase } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const { data: appointmentsData, isLoading: appointmentsLoading } = useAppointments({
    status: statusFilter || undefined,
    date: dateFilter || undefined,
  });
  const appointments = appointmentsData?.appointments || [];

  const { data: queueData, isLoading: queueLoading } = useQueue({
    status: 'WAITING',
  });
  const queueEntries = queueData?.entries || [];

  const cancelAppointmentMutation = useCancelAppointment();
  const callNextMutation = useCallNext();

  const handleCancelAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await cancelAppointmentMutation.mutateAsync(id);
      showToast('success', 'Appointment cancelled successfully');
    } catch (error: any) {
      showToast('error', error.message || 'Failed to cancel appointment');
    }
  };

  const handleCallNext = async () => {
    try {
      const result = await callNextMutation.mutateAsync();
      showToast('success', `Called ${result.entry.customer.name} from queue`);
    } catch (error: any) {
      showToast('error', error.message || 'Failed to call next customer');
    }
  };

  const stats = {
    totalAppointments: appointments.length,
    todayAppointments: appointments.filter((apt) => {
      const today = new Date().toISOString().split('T')[0];
      return apt.timeSlot.start.startsWith(today);
    }).length,
    queueLength: queueEntries.length,
    completedToday: appointments.filter((apt) => {
      const today = new Date().toISOString().split('T')[0];
      return apt.status === 'COMPLETED' && apt.timeSlot.start.startsWith(today);
    }).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Text variant="h1" className="mb-8">
          Admin Dashboard
        </Text>

        {/* Management Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/admin/services">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <Text variant="h3">Service Management</Text>
                  <Text variant="small" className="text-gray-600">
                    Configure services & pricing
                  </Text>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/admin/staff">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <Text variant="h3">Staff Management</Text>
                  <Text variant="small" className="text-gray-600">
                    Manage users & permissions
                  </Text>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/admin/activity">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <Text variant="h3">Activity Log</Text>
                  <Text variant="small" className="text-gray-600">
                    View system activity
                  </Text>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Appointments"
            value={stats.totalAppointments}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            }
          />
          <StatCard
            title="Today's Appointments"
            value={stats.todayAppointments}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
          <StatCard
            title="Queue Length"
            value={stats.queueLength}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            }
          />
          <StatCard
            title="Completed Today"
            value={stats.completedToday}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Appointments Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Text variant="h2">Appointments</Text>
            </div>
            <div className="flex gap-3 mb-4">
              <Select
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'SCHEDULED', label: 'Scheduled' },
                  { value: 'CONFIRMED', label: 'Confirmed' },
                  { value: 'IN_PROGRESS', label: 'In Progress' },
                  { value: 'COMPLETED', label: 'Completed' },
                  { value: 'CANCELLED', label: 'Cancelled' },
                ]}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                placeholder="Filter by status"
              />
            </div>
            <AppointmentList
              appointments={appointments}
              isLoading={appointmentsLoading}
              onCancel={handleCancelAppointment}
              emptyMessage="No appointments found"
            />
          </div>

          {/* Queue Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Text variant="h2">Current Queue</Text>
              <Button
                variant="primary"
                onClick={handleCallNext}
                isLoading={callNextMutation.isPending}
                disabled={queueEntries.length === 0}
              >
                Call Next
              </Button>
            </div>
            <QueuePanel entries={queueEntries} isLoading={queueLoading} />
          </div>
        </div>
      </main>
    </div>
  );
}
