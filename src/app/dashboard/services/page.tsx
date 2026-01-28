/**
 * Service Management Page
 * 
 * Purpose: CRUD interface for services configuration
 */

'use client';

import React, { useState } from 'react';
import { NavigationBar } from '@/components/organisms/NavigationBar';
import { Text } from '@/components/atoms/Text';
import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/molecules/Card';
import { Badge } from '@/components/atoms/Badge';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { useServices } from '@/hooks/use-services';
import { useToast } from '@/context/toast-context';
import { Plus, Edit, Trash2, Clock, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function ServiceManagementPage() {
  const { showToast } = useToast();
  const { data: servicesData, isLoading } = useServices();
  const services = servicesData?.services || [];
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    price: '',
    category: '',
    maxDailyAppointments: '',
  });

  const handleEdit = (service: any) => {
    setEditingId(service.id);
    setFormData({
      name: service.name,
      description: service.description,
      duration: service.duration.toString(),
      price: service.price.toString(),
      category: service.category,
      maxDailyAppointments: service.maxDailyAppointments?.toString() || '',
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      duration: '',
      price: '',
      category: '',
      maxDailyAppointments: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call to create/update service
    showToast('info', 'Service management API integration pending');
    handleCancel();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Text variant="h1" className="mb-2">
              Service Management
            </Text>
            <Text variant="body" className="text-gray-600">
              Configure services, pricing, and availability
            </Text>
          </div>
          
          <div className="flex gap-3">
            <Link href="/dashboard">
              <Button variant="secondary">
                ← Back to Dashboard
              </Button>
            </Link>
            
            {!showForm && (
              <Button
                variant="primary"
                onClick={() => setShowForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            )}
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <Card className="mb-8">
            <Text variant="h3" className="mb-6">
              {editingId ? 'Edit Service' : 'Add New Service'}
            </Text>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Service Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Medical Check-up"
                  required
                />
                
                <Select
                  label="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  options={[
                    { value: '', label: 'Select category' },
                    { value: 'medical', label: 'Medical' },
                    { value: 'dental', label: 'Dental' },
                    { value: 'consultation', label: 'Consultation' },
                    { value: 'other', label: 'Other' },
                  ]}
                  required
                />
              </div>

              <Input
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the service"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  type="number"
                  label="Duration (minutes)"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="30"
                  required
                />
                
                <Input
                  type="number"
                  label="Price ($)"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="50"
                  required
                />
                
                <Input
                  type="number"
                  label="Max Daily Appointments"
                  value={formData.maxDailyAppointments}
                  onChange={(e) => setFormData({ ...formData, maxDailyAppointments: e.target.value })}
                  placeholder="20"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="secondary" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editingId ? 'Update Service' : 'Create Service'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Services List */}
        <div className="grid gap-4">
          {isLoading && (
            <Card>
              <Text variant="body" className="text-gray-500 text-center py-8">
                Loading services...
              </Text>
            </Card>
          )}

          {!isLoading && services.length === 0 && (
            <Card>
              <Text variant="body" className="text-gray-500 text-center py-8">
                No services configured yet
              </Text>
            </Card>
          )}

          {!isLoading && services.map((service: any) => (
            <Card key={service.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Text variant="h3">{service.name}</Text>
                    {service.isActive ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="neutral">Inactive</Badge>
                    )}
                  </div>
                  
                  <Text variant="body" className="text-gray-600 mb-4">
                    {service.description}
                  </Text>
                  
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="w-4 h-4" />
                      <Text variant="small">{service.duration} min</Text>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-700">
                      <DollarSign className="w-4 h-4" />
                      <Text variant="small">${service.price}</Text>
                    </div>
                    
                    {service.maxDailyAppointments && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Text variant="small">Max: {service.maxDailyAppointments}/day</Text>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(service)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => showToast('info', 'Delete functionality pending')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
