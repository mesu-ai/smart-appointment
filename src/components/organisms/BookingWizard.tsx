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
import { getErrorMessage } from '@/lib/utils/error-handler.utils';
import type { Service } from '@/types/domain.types';

type BookingStep = 1 | 2 | 3 | 4 | 5 | 6;

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

interface StaffMember {
  id: string;
  name: string;
  currentAppointments: number;
  maxDailyAppointments: number;
  isAvailable: boolean;
  conflictReason?: string;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

interface BookingResult {
  status: 'SCHEDULED' | 'QUEUED';
  queuePosition?: number;
}

export function BookingWizard() {
  const { showToast } = useToast();
  const [step, setStep] = useState<BookingStep>(1);
  const [selectedService, setSelectedService] = useState<Service | undefined>();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | undefined>();
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | undefined>();
  const [availableStaff, setAvailableStaff] = useState<StaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [fallbackToQueue, setFallbackToQueue] = useState(false);
  const [bookingResult, setBookingResult] = useState<BookingResult | undefined>();
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

  const fetchAvailableStaff = async () => {
    if (!selectedService || !selectedDate || !selectedSlot) return;

    setLoadingStaff(true);
    try {
      const mockStaff: StaffMember[] = [
        {
          id: '1',
          name: 'Dr. Riya Sharma',
          currentAppointments: 4,
          maxDailyAppointments: 5,
          isAvailable: true,
        },
        {
          id: '2',
          name: 'Dr. Farhan Ahmed',
          currentAppointments: 5,
          maxDailyAppointments: 5,
          isAvailable: false,
          conflictReason: 'At capacity for today',
        },
        {
          id: '3',
          name: 'Dr. Sarah Johnson',
          currentAppointments: 3,
          maxDailyAppointments: 6,
          isAvailable: true,
        },
      ];
      
      setAvailableStaff(mockStaff);
      
      const available = mockStaff.filter(s => s.isAvailable);
      if (available.length === 1) {
        setSelectedStaff(available[0]);
      }
    } catch (error) {
      showToast('error', getErrorMessage(error));
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleStaffSelect = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setFallbackToQueue(false);
  };

  const handleQueueFallback = () => {
    setFallbackToQueue(true);
    setSelectedStaff(undefined);
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
      newErrors.phone = 'Phone number is required';
    } else {
      const cleanPhone = customerInfo.phone.replace(/[\s()-]/g, '');
      const isBDFormat = /^(\+880|880|0)?1[3-9]\d{8}$/.test(cleanPhone);
      const isInternational = /^\+?[1-9]\d{7,14}$/.test(cleanPhone);
      
      if (!isBDFormat && !isInternational) {
        newErrors.phone = 'Please enter a valid phone number (e.g., 01XXX-XXXXXX)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 2 && !selectedSlot) {
      showToast('error', 'Please select a time slot');
      return;
    }
    
    if (step === 2 && selectedSlot) {
      // Fetch staff when moving from time selection to staff selection
      fetchAvailableStaff();
    }

    if (step === 3 && !selectedStaff && !fallbackToQueue) {
      showToast('error', 'Please select a staff member or join the waiting queue');
      return;
    }

    if (step === 4) {
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

      setBookingResult({
        status: fallbackToQueue ? 'QUEUED' : 'SCHEDULED',
        queuePosition: fallbackToQueue ? 3 : undefined,
      });

      setStep(6);
      
      if (fallbackToQueue) {
        showToast('success', 'Added to waiting queue successfully');
      } else {
        showToast('success', 'Appointment booked successfully');
      }
    } catch (error) {
      showToast('error', getErrorMessage(error));
    }
  };

  const resetWizard = () => {
    setStep(1);
    setSelectedService(undefined);
    setSelectedDate('');
    setSelectedSlot(undefined);
    setSelectedStaff(undefined);
    setAvailableStaff([]);
    setFallbackToQueue(false);
    setBookingResult(undefined);
    setCustomerInfo({ name: '', email: '', phone: '', notes: '' });
    setErrors({});
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Indicator */}
      {step < 6 && (
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((s) => (
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
                {s < 5 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      s < step ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-center">
            <Text variant="caption" className="flex-1">Service</Text>
            <Text variant="caption" className="flex-1">Date & Time</Text>
            <Text variant="caption" className="flex-1">Select Staff</Text>
            <Text variant="caption" className="flex-1">Your Details</Text>
            <Text variant="caption" className="flex-1">Confirm</Text>
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

      {/* Step 3: Select Staff */}
      {step === 3 && selectedService && selectedDate && selectedSlot && (
        <div>
          <Text variant="h2" className="mb-6">
            Select Staff Member
          </Text>
          
          <Card className="mb-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Text variant="body">Service: {selectedService.name}</Text>
                <Badge variant="info">{selectedService.duration} min</Badge>
              </div>
              <Text variant="small" className="text-gray-600">
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })} at {selectedSlot.startTime}
              </Text>
            </div>
          </Card>

          {loadingStaff ? (
            <Card>
              <Text variant="body" className="text-gray-500 text-center py-8">
                Loading available staff...
              </Text>
            </Card>
          ) : (
            <>
              {availableStaff.length === 0 ? (
                <Alert variant="warning" className="mb-4">
                  No staff members found. Please select a different time slot.
                </Alert>
              ) : (
                <div className="space-y-3 mb-4">
                  {availableStaff.map((staff) => (
                    <div
                      key={staff.id}
                      className={`cursor-pointer transition-all ${
                        staff.isAvailable ? '' : 'opacity-60'
                      }`}
                      onClick={() => staff.isAvailable && handleStaffSelect(staff)}
                    >
                      <Card
                        className={`${
                          selectedStaff?.id === staff.id
                            ? 'ring-2 ring-blue-500 bg-blue-50'
                            : staff.isAvailable
                            ? 'hover:shadow-lg'
                            : ''
                        }`}
                      >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div>
                              <Text variant="h3">{staff.name}</Text>
                              <Text variant="small" className="text-gray-600">
                                {staff.currentAppointments}/{staff.maxDailyAppointments} appointments today
                              </Text>
                            </div>
                          </div>
                          {!staff.isAvailable && staff.conflictReason && (
                            <Alert variant="warning" className="mt-2">
                              ⚠️ {staff.conflictReason}
                            </Alert>
                          )}
                        </div>
                        <div>
                          {staff.isAvailable ? (
                            <Badge variant="success">Available</Badge>
                          ) : (
                            <Badge variant="neutral">Unavailable</Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                    </div>
                  ))}
                </div>
              )}

              {availableStaff.filter(s => s.isAvailable).length === 0 && availableStaff.length > 0 && (
                <Alert variant="info" className="mb-4">
                  <div className="space-y-2">
                    <Text variant="body" className="font-semibold">
                      All staff members are at capacity for this time slot
                    </Text>
                    <Text variant="small">
                      You can join the waiting queue and we&apos;ll notify you when a slot becomes available.
                    </Text>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleQueueFallback}
                      className="mt-2"
                    >
                      {fallbackToQueue ? '✓ Added to Queue' : 'Join Waiting Queue'}
                    </Button>
                  </div>
                </Alert>
              )}

              {fallbackToQueue && (
                <Alert variant="success" className="mb-4">
                  ✓ You&apos;ll be added to the waiting queue for this time slot.
                  We&apos;ll notify you when a staff member becomes available.
                </Alert>
              )}
            </>
          )}

          <div className="flex gap-3 mt-6">
            <Button variant="secondary" onClick={handleBack}>
              Back
            </Button>
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!selectedStaff && !fallbackToQueue}
              fullWidth
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Customer Info */}
      {step === 4 && (
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
                placeholder="01XXX-XXXXXX"
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

      {/* Step 5: Confirmation */}
      {step === 5 && selectedService && selectedSlot && (
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
              {selectedStaff && (
                <div>
                  <Text variant="caption">Assigned Staff</Text>
                  <Text variant="body">{selectedStaff.name}</Text>
                </div>
              )}
              {fallbackToQueue && (
                <div>
                  <Text variant="caption">Booking Status</Text>
                  <Badge variant="info">Waiting Queue</Badge>
                  <Text variant="small" className="text-gray-600 mt-1">
                  You&apos;ll be notified when a staff member becomes available
                  </Text>
                </div>
              )}
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
          {!fallbackToQueue ? (
            <Alert variant="info" className="mb-6">
              Please review your appointment details carefully. You will receive a
              confirmation email at {customerInfo.email}.
            </Alert>
          ) : (
            <Alert variant="warning" className="mb-6">
              You are joining the waiting queue. We&apos;ll notify you at {customerInfo.email} when
              a staff member becomes available for your selected time slot.
            </Alert>
          )}
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
              {fallbackToQueue ? 'Join Waiting Queue' : 'Confirm Booking'}
            </Button>
          </div>
        </div>
      )}

      {/* Step 6: Success */}
      {step === 6 && (
        <Card className="text-center py-12">
          <div className="flex justify-center mb-4">
            {bookingResult?.status === 'QUEUED' ? (
              <svg
                className="w-16 h-16 text-blue-500"
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
            ) : (
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
            )}
          </div>
          
          {bookingResult?.status === 'QUEUED' ? (
            <>
              <Text variant="h2" className="mb-2">
                Added to Waiting Queue!
              </Text>
              {bookingResult.queuePosition && (
                <Badge variant="info" className="mb-4">
                  Position #{bookingResult.queuePosition} in queue
                </Badge>
              )}
              <Text variant="body" className="mb-6">
                Your appointment request has been added to the waiting queue.
                We&apos;ll notify you at {customerInfo.email} when a staff member becomes available.
              </Text>
              <Alert variant="info" className="mb-6">
                <Text variant="small">
                  What happens next:
                </Text>
                <ul className="text-left mt-2 space-y-1 text-sm">
                  <li>• You&apos;ll receive an email confirmation of your queue position</li>
                  <li>• We&apos;ll notify you when a slot opens up</li>
                  <li>• You can check your queue status anytime</li>
                </ul>
              </Alert>
            </>
          ) : (
            <>
              <Text variant="h2" className="mb-2">
                Booking Confirmed!
              </Text>
              <Text variant="body" className="mb-6">
                Your appointment has been successfully booked. A confirmation email has
                been sent to {customerInfo.email}.
              </Text>
              {selectedStaff && (
                <Card className="mb-6 bg-blue-50">
                  <Text variant="small" className="text-gray-600 mb-1">Assigned Staff</Text>
                  <Text variant="body" className="font-semibold">{selectedStaff.name}</Text>
                </Card>
              )}
            </>
          )}
          
          <Button variant="primary" onClick={resetWizard}>
            Book Another Appointment
          </Button>
        </Card>
      )}
    </div>
  );
}
