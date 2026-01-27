/**
 * ServiceCard Molecule Component
 * 
 * Purpose: Display service information
 * Combines: Card + Text + Badge
 */

'use client';

import React from 'react';
import { Card } from './Card';
import { Text } from '../atoms/Text';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import type { Service } from '@/types/domain.types';

export interface ServiceCardProps {
  service: Service;
  onSelect?: (service: Service) => void;
  selected?: boolean;
}

export function ServiceCard({ service, onSelect, selected = false }: ServiceCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all ${
        selected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-lg'
      }`}
      onClick={() => onSelect?.(service)}
    >
      <div className="flex items-start justify-between mb-3">
        <Text variant="h3">{service.name}</Text>
        <Badge variant={service.isActive ? 'success' : 'neutral'}>
          {service.isActive ? 'Available' : 'Unavailable'}
        </Badge>
      </div>

      <Text variant="small" className="mb-4">
        {service.description}
      </Text>

      <div className="flex items-center justify-between">
        <div>
          <Text variant="caption" className="block">
            Duration
          </Text>
          <Text variant="body" className="font-semibold">
            {service.duration} min
          </Text>
        </div>
        <div>
          <Text variant="caption" className="block">
            Price
          </Text>
          <Text variant="body" className="font-semibold">
            ${service.price.toFixed(2)}
          </Text>
        </div>
      </div>

      {onSelect && (
        <Button
          variant={selected ? 'primary' : 'secondary'}
          fullWidth
          className="mt-4"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(service);
          }}
        >
          {selected ? 'Selected' : 'Select Service'}
        </Button>
      )}
    </Card>
  );
}
