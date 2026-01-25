'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Users, Clock, TrendingUp, CheckCircle, XCircle, PlayCircle } from 'lucide-react';
import { useAppointments } from '@/context/AppointmentContext';
import { format } from 'date-fns';

export default function AdminPage() {
  const { 
    appointments, 
    queue, 
    updateAppointmentStatus, 
    updateQueueStatus,
    cancelAppointment 
  } = useAppointments();
  
  const [activeTab, setActiveTab] = useState('appointments');

  const upcomingAppointments = appointments.filter(apt => apt.status === 'scheduled');
  const completedAppointments = appointments.filter(apt => apt.status === 'completed');
  const activeQueue = queue.filter(entry => entry.status === 'waiting');

  const stats = [
    {
      label: 'Total Appointments',
      value: appointments.length,
      icon: Calendar,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'In Queue',
      value: activeQueue.length,
      icon: Users,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      label: 'Completed Today',
      value: completedAppointments.filter(apt => 
        format(new Date(apt.createdAt), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
      ).length,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Avg Wait Time',
      value: '15 min',
      icon: Clock,
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  const handleServeNext = () => {
    const nextInQueue = queue.find(entry => entry.status === 'waiting');
    if (nextInQueue) {
      updateQueueStatus(nextInQueue.id, 'serving');
    }
  };

  const handleCompleteQueue = (id) => {
    updateQueueStatus(id, 'completed');
  };

  const handleCancelQueue = (id) => {
    updateQueueStatus(id, 'cancelled');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage appointments and queue in real-time</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8 px-6">
              <button
                onClick={() => setActiveTab('appointments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'appointments'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Appointments ({appointments.length})
              </button>
              <button
                onClick={() => setActiveTab('queue')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'queue'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Queue ({queue.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'appointments' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">All Appointments</h2>
                </div>

                {appointments.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No appointments yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {appointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{appointment.name}</h3>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {appointment.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
                              <p>Service: {appointment.serviceName}</p>
                              <p>Price: ${appointment.price}</p>
                              <p>Date: {format(new Date(appointment.date), 'MMM d, yyyy')}</p>
                              <p>Time: {appointment.time}</p>
                              <p>Email: {appointment.email}</p>
                              <p>Phone: {appointment.phone}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            {appointment.status === 'scheduled' && (
                              <>
                                <button
                                  onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                                >
                                  Complete
                                </button>
                                <button
                                  onClick={() => cancelAppointment(appointment.id)}
                                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'queue' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Queue Management</h2>
                  <button
                    onClick={handleServeNext}
                    disabled={activeQueue.length === 0}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <PlayCircle className="w-4 h-4" />
                    Serve Next
                  </button>
                </div>

                {queue.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No one in queue</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {queue.map((entry) => (
                      <div
                        key={entry.id}
                        className={`border-2 rounded-lg p-4 ${
                          entry.status === 'serving' 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-200 hover:bg-gray-50'
                        } transition-colors`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              entry.status === 'serving' 
                                ? 'bg-green-500 text-white' 
                                : 'bg-purple-100 text-purple-600'
                            }`}>
                              <span className="text-xl font-bold">#{entry.position}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-semibold text-gray-900">{entry.name}</h3>
                                {entry.status === 'serving' && (
                                  <span className="px-2 py-1 bg-green-600 text-white rounded text-xs font-medium animate-pulse">
                                    NOW SERVING
                                  </span>
                                )}
                                {entry.status === 'completed' && (
                                  <span className="px-2 py-1 bg-gray-600 text-white rounded text-xs font-medium">
                                    COMPLETED
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-x-6 text-sm text-gray-600">
                                <p>Service: {entry.serviceName}</p>
                                <p>Wait: ~{entry.estimatedWaitTime} min</p>
                                <p>Email: {entry.email}</p>
                                <p>Joined: {format(new Date(entry.joinedAt), 'HH:mm')}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            {entry.status === 'waiting' && (
                              <button
                                onClick={() => updateQueueStatus(entry.id, 'serving')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                              >
                                Serve Now
                              </button>
                            )}
                            {entry.status === 'serving' && (
                              <button
                                onClick={() => handleCompleteQueue(entry.id)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                              >
                                Complete
                              </button>
                            )}
                            {(entry.status === 'waiting' || entry.status === 'serving') && (
                              <button
                                onClick={() => handleCancelQueue(entry.id)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
