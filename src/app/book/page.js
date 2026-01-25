'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, User, Mail, Phone, ArrowLeft, Check } from 'lucide-react';
import { useAppointments } from '@/context/AppointmentContext';
import { format, addDays } from 'date-fns';

export default function BookAppointment() {
  const router = useRouter();
  const { services, generateTimeSlots, bookAppointment } = useAppointments();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceId: '',
    date: '',
    time: '',
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [confirmationId, setConfirmationId] = useState(null);

  const handleServiceSelect = (serviceId) => {
    setFormData(prev => ({ ...prev, serviceId }));
    setStep(2);
  };

  const handleDateSelect = (date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    setFormData(prev => ({ ...prev, date: dateString }));
    const slots = generateTimeSlots(date);
    setAvailableSlots(slots);
    setStep(3);
  };

  const handleTimeSelect = (time) => {
    setFormData(prev => ({ ...prev, time }));
    setStep(4);
  };

  const handlePersonalInfoSubmit = (e) => {
    e.preventDefault();
    const service = services.find(s => s.id === parseInt(formData.serviceId));
    const appointment = bookAppointment({
      ...formData,
      serviceName: service.name,
      price: service.price,
      duration: service.duration,
    });
    setConfirmationId(appointment.id);
    setStep(5);
  };

  const getNext7Days = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(new Date(), i));
    }
    return days;
  };

  const selectedService = services.find(s => s.id === parseInt(formData.serviceId));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Book an Appointment</h1>
            <div className="flex items-center gap-4 mt-4">
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {num}
                  </div>
                  {num < 5 && <div className={`w-12 h-0.5 ${step > num ? 'bg-blue-600' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>
          </div>

          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select a Service</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceSelect(service.id)}
                    className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                  >
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{service.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {service.duration} min
                      </span>
                      <span className="font-medium text-blue-600">${service.price}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select a Date</h2>
              <p className="text-gray-600 mb-4">Service: <span className="font-medium text-gray-900">{selectedService?.name}</span></p>
              <div className="grid grid-cols-7 gap-3">
                {getNext7Days().map((date) => (
                  <button
                    key={date.toISOString()}
                    onClick={() => handleDateSelect(date)}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    <div className="text-xs text-gray-600 mb-1">{format(date, 'EEE')}</div>
                    <div className="text-lg font-semibold text-gray-900">{format(date, 'd')}</div>
                    <div className="text-xs text-gray-600">{format(date, 'MMM')}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep(1)}
                className="mt-6 px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select a Time</h2>
              <p className="text-gray-600 mb-4">
                Service: <span className="font-medium text-gray-900">{selectedService?.name}</span> |
                Date: <span className="font-medium text-gray-900">{format(new Date(formData.date), 'MMMM d, yyyy')}</span>
              </p>
              <div className="grid grid-cols-4 gap-3">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => handleTimeSelect(slot)}
                    className="p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all font-medium text-gray-900"
                  >
                    {slot}
                  </button>
                ))}
              </div>
              {availableSlots.length === 0 && (
                <p className="text-center text-gray-600 py-8">No available slots for this date.</p>
              )}
              <button
                onClick={() => setStep(2)}
                className="mt-6 px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Information</h2>
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Appointment Summary</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>Service: {selectedService?.name}</p>
                  <p>Date: {format(new Date(formData.date), 'MMMM d, yyyy')}</p>
                  <p>Time: {formData.time}</p>
                  <p>Duration: {selectedService?.duration} minutes</p>
                  <p className="font-semibold">Price: ${selectedService?.price}</p>
                </div>
              </div>

              <form onSubmit={handlePersonalInfoSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="w-4 h-4 inline mr-1" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 5 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
              <p className="text-gray-600 mb-6">
                Your appointment has been successfully scheduled.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-3">Appointment Details</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><span className="font-medium">Confirmation ID:</span> #{confirmationId}</p>
                  <p><span className="font-medium">Service:</span> {selectedService?.name}</p>
                  <p><span className="font-medium">Date:</span> {format(new Date(formData.date), 'MMMM d, yyyy')}</p>
                  <p><span className="font-medium">Time:</span> {formData.time}</p>
                  <p><span className="font-medium">Name:</span> {formData.name}</p>
                  <p><span className="font-medium">Email:</span> {formData.email}</p>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Link
                  href="/"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Back to Home
                </Link>
                <button
                  onClick={() => {
                    setStep(1);
                    setFormData({ name: '', email: '', phone: '', serviceId: '', date: '', time: '' });
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Book Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
