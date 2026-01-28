/**
 * BookingWizard Organism Component
 * 
 * Purpose: Multi-step appointment booking flow
 * Steps: 1. Select Service → 2. Select Date/Time → 3. Enter Details → 4. Confirm → 5. Success
 */

'use client';

import { useState } from 'react';
import { ServiceSelector } from './ServiceSelector';
import { TimeSlotPicker } from '../organisms/TimeSlotPicker';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { Text } from '../atoms/Text';
import { Card } from '../molecules/Card';
import { Alert } from '../molecules/Alert';
import { Badge } from '../atoms/Badge';
import { useServices, useAvailableSlots } from '@/hooks/use-services';
import { useCreateAppointment } from '@/hooks/use-appointments';
import { useToast } from '@/context/toast-context';
import type { Service } from '@/types/domain.types';

type BookingStep = 1 | 2 | 3 | 4 | 5;

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

export function BookingWizard() {
  const { showToast } = useToast();
  const [step, setStep] = useState<BookingStep>(1);
  const [selectedService, setSelectedService] = useState<Service | undefined>();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | undefined>();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Partial<CustomerInfo>>({});

  const { data: servicesData, isLoading: servicesLoading } = useServices();
  const services = servicesData?.services || [];

  const { data: slotsData, isLoading: slotsLoading } = useAvailableSlots(
    selectedService?.id || '',
    selectedDate
  );
  const slots = slotsData?.slots || [];

  const createAppointmentMutation = useCreateAppointment();

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(undefined);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const handleCustomerInfoChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateCustomerInfo = (): boolean => {
    const newErrors: Partial<CustomerInfo> = {};

    if (!customerInfo.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!customerInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!customerInfo.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(customerInfo.phone.replace(/[\s()-]/g, ''))) {
      newErrors.phone = 'Invalid phone format (use E.164 format, e.g., +1234567890)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 2 && !selectedSlot) {
      showToast('error', 'Please select a time slot');
      return;
    }

    if (step === 3) {
      if (!validateCustomerInfo()) {
        return;
      }
    }

    setStep((prev) => (prev + 1) as BookingStep);
  };

  const handleBack = () => {
    setStep((prev) => (prev - 1) as BookingStep);
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedSlot) return;

    try {
      await createAppointmentMutation.mutateAsync({
        serviceId: selectedService.id,
        date: selectedDate,
        timeSlot: {
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
        },
        customerInfo: {
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
          notes: customerInfo.notes,
        },
      });

      setStep(5);
      showToast('success', 'Appointment booked successfully!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to book appointment';
      showToast('error', errorMessage);
    }
  };

  const resetWizard = () => {
    setStep(1);
    setSelectedService(undefined);
    setSelectedDate('');
    setSelectedSlot(undefined);
    setCustomerInfo({ name: '', email: '', phone: '', notes: '' });
    setErrors({});
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Indicator */}
      {step < 5 && (
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    s <= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      s < step ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <Text variant="caption">Select Service</Text>
            <Text variant="caption">Date & Time</Text>
            <Text variant="caption">Your Details</Text>
            <Text variant="caption">Confirm</Text>
          </div>
        </div>
      )}

      {/* Step 1: Select Service */}
      {step === 1 && (
        <div>
          <Text variant="h2" className="mb-6">
            Select a Service
          </Text>
          <ServiceSelector
            services={services}
            selectedService={selectedService}
            onSelect={handleServiceSelect}
            isLoading={servicesLoading}
          />
        </div>
      )}

      {/* Step 2: Select Date & Time */}
      {step === 2 && selectedService && (
        <div>
          <Text variant="h2" className="mb-6">
            Choose Date & Time
          </Text>
          <Card className="mb-4">
            <div className="flex items-center justify-between">
              <Text variant="body">Selected Service: {selectedService.name}</Text>
              <Badge variant="info">{selectedService.duration} min</Badge>
            </div>
          </Card>
          <TimeSlotPicker
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            onDateChange={handleDateChange}
            onSlotSelect={handleSlotSelect}
            slots={slots}
            isLoading={slotsLoading}
          />
          <div className="flex gap-3 mt-6">
            <Button variant="secondary" onClick={handleBack}>
              Back
            </Button>
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!selectedSlot}
              fullWidth
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Customer Info */}
      {step === 3 && (
        <div>
          <Text variant="h2" className="mb-6">
            Your Information
          </Text>
          <Card>
            <div className="space-y-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={customerInfo.name}
                onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
                error={errors.name}
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="john@example.com"
                value={customerInfo.email}
                onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                error={errors.email}
              />
              <Input
                label="Phone Number"
                type="tel"
                placeholder="+1234567890"
                value={customerInfo.phone}
                onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                error={errors.phone}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Any special requests or information..."
                  value={customerInfo.notes}
                  onChange={(e) => handleCustomerInfoChange('notes', e.target.value)}
                />
              </div>
            </div>
          </Card>
          <div className="flex gap-3 mt-6">
            <Button variant="secondary" onClick={handleBack}>
              Back
            </Button>
            <Button variant="primary" onClick={handleNext} fullWidth>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && selectedService && selectedSlot && (
        <div>
          <Text variant="h2" className="mb-6">
            Confirm Your Appointment
          </Text>
          <Card className="mb-6">
            <div className="space-y-4">
              <div>
                <Text variant="caption">Service</Text>
                <Text variant="h3">{selectedService.name}</Text>
              </div>
              <div>
                <Text variant="caption">Date & Time</Text>
                <Text variant="body">
                  {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
                <Text variant="body">
                  {selectedSlot.startTime} - {selectedSlot.endTime}
                </Text>
              </div>
              <div>
                <Text variant="caption">Your Details</Text>
                <Text variant="body">{customerInfo.name}</Text>
                <Text variant="small">{customerInfo.email}</Text>
                <Text variant="small">{customerInfo.phone}</Text>
                {customerInfo.notes && (
                  <Text variant="small" className="mt-2">
                    Notes: {customerInfo.notes}
                  </Text>
                )}
              </div>
              <div>
                <Text variant="caption">Price</Text>
                <Text variant="h3">${selectedService.price.toFixed(2)}</Text>
              </div>
            </div>
          </Card>
          <Alert variant="info" className="mb-6">
            Please review your appointment details carefully. You will receive a
            confirmation email at {customerInfo.email}.
          </Alert>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleBack}>
              Back
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              isLoading={createAppointmentMutation.isPending}
              fullWidth
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      )}

      {/* Step 5: Success */}
      {step === 5 && (
        <Card className="text-center py-12">
          <div className="flex justify-center mb-4">
            <svg
              className="w-16 h-16 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <Text variant="h2" className="mb-2">
            Booking Confirmed!
          </Text>
          <Text variant="body" className="mb-6">
            Your appointment has been successfully booked. A confirmation email has
            been sent to {customerInfo.email}.
          </Text>
          <Button variant="primary" onClick={resetWizard}>
            Book Another Appointment
          </Button>
        </Card>
      )}
    </div>
  );
}
