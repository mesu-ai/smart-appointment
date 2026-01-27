/**
 * Activity Log Page
 * 
 * Purpose: Audit log viewer with filtering
 */

'use client';

import { useState, useEffect } from 'react';
import { NavigationBar } from '@/components/organisms/NavigationBar';
import { Text } from '@/components/atoms/Text';
import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/molecules/Card';
import { Badge } from '@/components/atoms/Badge';
import { Select } from '@/components/atoms/Select';
import { Input } from '@/components/atoms/Input';
import { useToast } from '@/context/toast-context';
import { apiClient } from '@/lib/api/client';
import { Clock, User, FileText, Filter } from 'lucide-react';
import Link from 'next/link';

export default function ActivityLogPage() {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
    startDate: '',
    endDate: '',
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.action) params.append('action', filters.action);
      if (filters.entityType) params.append('entityType', filters.entityType);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const queryString = params.toString();
      const url = `/api/audit-logs${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiClient.get<{ logs: any[]; total: number }>(url);
      setLogs(response.logs);
    } catch (error: any) {
      if (error.message.includes('403')) {
        showToast('error', 'Staff access required');
      } else {
        showToast('error', 'Failed to load activity logs');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleFilter = () => {
    fetchLogs();
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({
      action: '',
      entityType: '',
      startDate: '',
      endDate: '',
    });
    setTimeout(() => fetchLogs(), 0);
  };

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('CREATED')) return 'success';
    if (action.includes('UPDATED')) return 'info';
    if (action.includes('CANCELLED') || action.includes('DELETED')) return 'error';
    return 'neutral';
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Text variant="h1" className="mb-2">
              Activity Log
            </Text>
            <Text variant="body" className="text-gray-600">
              Track all system activities and changes
            </Text>
          </div>
          
          <div className="flex gap-3">
            <Link href="/admin">
              <Button variant="secondary">
                ← Back to Admin
              </Button>
            </Link>
            
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
            
            <Button variant="primary" onClick={fetchLogs}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card className="mb-6">
            <Text variant="h3" className="mb-4">Filters</Text>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <Select
                label="Action"
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                options={[
                  { value: '', label: 'All Actions' },
                  { value: 'APPOINTMENT_CREATED', label: 'Appointment Created' },
                  { value: 'APPOINTMENT_UPDATED', label: 'Appointment Updated' },
                  { value: 'APPOINTMENT_CANCELLED', label: 'Appointment Cancelled' },
                  { value: 'QUEUE_JOINED', label: 'Queue Joined' },
                  { value: 'QUEUE_CALLED', label: 'Queue Called' },
                  { value: 'QUEUE_COMPLETED', label: 'Queue Completed' },
                  { value: 'QUEUE_CANCELLED', label: 'Queue Cancelled' },
                ]}
              />
              
              <Select
                label="Entity Type"
                value={filters.entityType}
                onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
                options={[
                  { value: '', label: 'All Types' },
                  { value: 'APPOINTMENT', label: 'Appointment' },
                  { value: 'QUEUE_ENTRY', label: 'Queue Entry' },
                  { value: 'SERVICE', label: 'Service' },
                  { value: 'USER', label: 'User' },
                ]}
              />
              
              <Input
                type="date"
                label="Start Date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
              
              <Input
                type="date"
                label="End Date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
            
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={handleClearFilters}>
                Clear Filters
              </Button>
              <Button variant="primary" onClick={handleFilter}>
                Apply Filters
              </Button>
            </div>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card padding="md">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <Text variant="small" className="text-gray-600">Total Logs</Text>
                <Text variant="h2">{logs.length}</Text>
              </div>
            </div>
          </Card>
          
          <Card padding="md">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-green-600" />
              <div>
                <Text variant="small" className="text-gray-600">Today</Text>
                <Text variant="h2">
                  {logs.filter(log => {
                    const logDate = new Date(log.timestamp).toDateString();
                    const today = new Date().toDateString();
                    return logDate === today;
                  }).length}
                </Text>
              </div>
            </div>
          </Card>
          
          <Card padding="md">
            <div className="flex items-center gap-3">
              <User className="w-8 h-8 text-purple-600" />
              <div>
                <Text variant="small" className="text-gray-600">Unique Users</Text>
                <Text variant="h2">
                  {new Set(logs.map(log => log.userId).filter(Boolean)).size}
                </Text>
              </div>
            </div>
          </Card>
        </div>

        {/* Logs List */}
        <div className="space-y-3">
          {loading && (
            <Card>
              <Text variant="body" className="text-gray-500 text-center py-8">
                Loading activity logs...
              </Text>
            </Card>
          )}

          {!loading && logs.length === 0 && (
            <Card>
              <Text variant="body" className="text-gray-500 text-center py-8">
                No activity logs found
              </Text>
            </Card>
          )}

          {!loading && logs.map((log) => (
            <Card key={log.id} padding="md" className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant={getActionBadgeVariant(log.action)}>
                      {formatAction(log.action)}
                    </Badge>
                    <Badge variant="neutral">{log.entityType}</Badge>
                    <Text variant="small" className="text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </Text>
                  </div>
                  
                  <div className="space-y-1">
                    {log.userName && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <Text variant="small" className="text-gray-700">
                          By: {log.userName}
                        </Text>
                      </div>
                    )}
                    
                    <Text variant="small" className="text-gray-600">
                      Entity ID: {log.entityId}
                    </Text>
                    
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                          View Details
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
