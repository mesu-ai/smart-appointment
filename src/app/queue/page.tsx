/**
 * Queue Status Page (New Implementation)
 * 
 * Purpose: View and join queue, see current status with React Query
 */

'use client';

import React, { useState } from 'react';
import { NavigationBar } from '@/components/organisms/NavigationBar';
import { QueuePanel } from '@/components/organisms/QueuePanel';
import { ServiceSelector } from '@/components/organisms/ServiceSelector';
import { Text } from '@/components/atoms/Text';
import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/molecules/Card';
import { Input } from '@/components/atoms/Input';
import { Badge } from '@/components/atoms/Badge';
import { Select } from '@/components/atoms/Select';
import { useQueue, useJoinQueue, useLeaveQueue } from '@/hooks/use-queue';
import { useServices } from '@/hooks/use-services';
import { useToast } from '@/context/toast-context';
import type { Service } from '@/types/domain.types';

export default function QueueStatusNew() {
  const { showToast } = useToast();
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | undefined>();
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    priority: 'NORMAL',
  });

  const { data: servicesData } = useServices();
  const services = servicesData?.services || [];

  const { data: queueData, isLoading: queueLoading } = useQueue();
  const queueEntries = queueData?.entries || [];

  const joinQueueMutation = useJoinQueue();

  const handleJoinQueue = async () => {
    if (!selectedService) {
      showToast('error', 'Please select a service');
      return;
    }

    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      showToast('error', 'Please fill in all required fields');
      return;
    }

    try {
      await joinQueueMutation.mutateAsync({
        serviceId: selectedService.id,
        customer: {
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
        },
        priority: customerInfo.priority as 'HIGH' | 'NORMAL',
      });

      showToast('success', 'Successfully joined the queue!');
      setShowJoinForm(false);
      setCustomerInfo({ name: '', email: '', phone: '', priority: 'NORMAL' });
      setSelectedService(undefined);
    } catch (error: any) {
      showToast('error', error.message || 'Failed to join queue');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <Text variant="h1">Queue Status</Text>
          <Button
            variant="primary"
            onClick={() => setShowJoinForm(!showJoinForm)}
          >
            {showJoinForm ? 'Cancel' : 'Join Queue'}
          </Button>
        </div>

        {/* Join Queue Form */}
        {showJoinForm && (
          <Card className="mb-8">
            <Text variant="h2" className="mb-6">
              Join the Queue
            </Text>
            
            <div className="mb-6">
              <Text variant="body" className="mb-3 font-medium">
                Select Service
              </Text>
              <ServiceSelector
                services={services}
                selectedService={selectedService}
                onSelect={setSelectedService}
              />
            </div>

            {selectedService && (
              <div className="space-y-4">
                <Input
                  label="Your Name"
                  placeholder="John Doe"
                  value={customerInfo.name}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, name: e.target.value })
                  }
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="john@example.com"
                  value={customerInfo.email}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, email: e.target.value })
                  }
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+1234567890"
                  value={customerInfo.phone}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, phone: e.target.value })
                  }
                />
                <Select
                  label="Priority"
                  options={[
                    { value: 'NORMAL', label: 'Normal' },
                    { value: 'HIGH', label: 'High (for urgent cases)' },
                  ]}
                  value={customerInfo.priority}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, priority: e.target.value })
                  }
                />
                <Button
                  variant="primary"
                  onClick={handleJoinQueue}
                  isLoading={joinQueueMutation.isPending}
                  fullWidth
                >
                  Join Queue
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Current Queue */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Text variant="h2">Current Queue</Text>
            <Badge variant="info">{queueEntries.length} in queue</Badge>
          </div>
          <QueuePanel entries={queueEntries} isLoading={queueLoading} />
        </div>
      </main>
    </div>
  );
}
