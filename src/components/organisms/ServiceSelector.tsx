/**
 * ServiceSelector Organism Component
 * 
 * Purpose: Service selection step in booking flow
 * Combines: Multiple ServiceCards + Grid layout
 */

'use client';

import { ServiceCard } from '../molecules/ServiceCard';
import { EmptyState } from '../molecules/EmptyState';
import { Spinner } from '../atoms/Spinner';
import type { Service } from '@/types/domain.types';

export interface ServiceSelectorProps {
  services: Service[];
  selectedService?: Service;
  onSelect: (service: Service) => void;
  isLoading?: boolean;
}

export function ServiceSelector({
  services,
  selectedService,
  onSelect,
  isLoading = false,
}: ServiceSelectorProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <EmptyState
        title="No services available"
        description="Please check back later for available services."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          selected={selectedService?.id === service.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
