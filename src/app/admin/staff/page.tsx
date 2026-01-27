/**
 * Staff Management Page
 * 
 * Purpose: User/staff CRUD interface with role management
 */

'use client';

import React, { useState, useEffect } from 'react';
import { NavigationBar } from '@/components/organisms/NavigationBar';
import { Text } from '@/components/atoms/Text';
import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/molecules/Card';
import { Badge } from '@/components/atoms/Badge';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { useToast } from '@/context/toast-context';
import { apiClient } from '@/lib/api/client';
import { Plus, Edit, Trash2, User, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

export default function StaffManagementPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'STAFF',
    password: '',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{ users: any[]; total: number }>('/api/users');
      setUsers(response.users);
    } catch (error: any) {
      if (error.message.includes('403')) {
        showToast('error', 'Admin access required');
      } else {
        showToast('error', 'Failed to load users');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user: any) => {
    setEditingId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      password: '', // Don't show existing password
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'STAFF',
      password: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        // Update user
        const updateData: any = {
          name: formData.name,
          phone: formData.phone || undefined,
          role: formData.role,
        };
        
        if (formData.password) {
          updateData.password = formData.password;
        }
        
        await apiClient.patch(`/api/users/${editingId}`, updateData);
        showToast('success', 'User updated successfully');
      } else {
        // Create user
        await apiClient.post('/api/users', formData);
        showToast('success', 'User created successfully');
      }
      
      handleCancel();
      fetchUsers();
    } catch (error: any) {
      showToast('error', error.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) {
      return;
    }
    
    try {
      await apiClient.delete(`/api/users/${id}`);
      showToast('success', 'User deleted successfully');
      fetchUsers();
    } catch (error: any) {
      showToast('error', error.message || 'Failed to delete user');
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'error';
      case 'STAFF':
        return 'info';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Text variant="h1" className="mb-2">
              Staff Management
            </Text>
            <Text variant="body" className="text-gray-600">
              Manage user accounts and permissions
            </Text>
          </div>
          
          <div className="flex gap-3">
            <Link href="/admin">
              <Button variant="secondary">
                ← Back to Admin
              </Button>
            </Link>
            
            {!showForm && (
              <Button
                variant="primary"
                onClick={() => setShowForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            )}
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <Card className="mb-8">
            <Text variant="h3" className="mb-6">
              {editingId ? 'Edit User' : 'Add New User'}
            </Text>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
                
                <Input
                  type="email"
                  label="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  required
                  disabled={!!editingId} // Can't change email for existing users
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="tel"
                  label="Phone (optional)"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1234567890"
                />
                
                <Select
                  label="Role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  options={[
                    { value: 'STAFF', label: 'Staff' },
                    { value: 'ADMIN', label: 'Administrator' },
                  ]}
                  required
                />
              </div>

              <Input
                type="password"
                label={editingId ? 'New Password (leave blank to keep current)' : 'Password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required={!editingId}
              />

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="secondary" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editingId ? 'Update User' : 'Create User'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Users List */}
        <div className="grid gap-4">
          {loading && (
            <Card>
              <Text variant="body" className="text-gray-500 text-center py-8">
                Loading users...
              </Text>
            </Card>
          )}

          {!loading && users.length === 0 && (
            <Card>
              <Text variant="body" className="text-gray-500 text-center py-8">
                No users found
              </Text>
            </Card>
          )}

          {!loading && users.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <Text variant="h3">{user.name}</Text>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </Badge>
                        {user.isActive ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="neutral">Inactive</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 ml-14">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail className="w-4 h-4" />
                      <Text variant="small">{user.email}</Text>
                    </div>
                    
                    {user.phone && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-4 h-4" />
                        <Text variant="small">{user.phone}</Text>
                      </div>
                    )}
                    
                    {user.lastLoginAt && (
                      <Text variant="small" className="text-gray-500">
                        Last login: {new Date(user.lastLoginAt).toLocaleDateString()}
                      </Text>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(user)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(user.id, user.name)}
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
