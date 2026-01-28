import Link from 'next/link';
import { Calendar, Clock, Users, BarChart } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">SmartQueue</span>
            </div>
            <div className="flex gap-4">
              <Link href="/dashboard" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/queue" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                Queue Status
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Smart Appointment & Queue Manager
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Streamline your appointment booking and manage queues efficiently with our intelligent system
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Link href="/book" className="group">
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-500">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                <Calendar className="w-8 h-8 text-blue-600 group-hover:text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Book Appointment</h2>
              <p className="text-gray-600">
                Schedule your appointment with ease. Choose your preferred date, time, and service.
              </p>
            </div>
          </Link>

          <Link href="/queue" className="group">
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-500">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors">
                <Clock className="w-8 h-8 text-purple-600 group-hover:text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Queue Status</h2>
              <p className="text-gray-600">
                Check your position in the queue and estimated wait time in real-time.
              </p>
            </div>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold text-gray-900">Easy Management</h3>
            </div>
            <p className="text-sm text-gray-600">
              Manage appointments and queues from a single dashboard
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-6 h-6 text-orange-600" />
              <h3 className="font-semibold text-gray-900">Real-time Updates</h3>
            </div>
            <p className="text-sm text-gray-600">
              Get instant notifications about queue status and appointments
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <BarChart className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Analytics</h3>
            </div>
            <p className="text-sm text-gray-600">
              Track performance with comprehensive analytics and reports
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600">
            © 2026 SmartQueue. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
