'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';
import { apiService } from '@/utils/api';
import { 
  ArrowLeft,
  Search,
  Edit,
  Trash2,
  Plus,
  Users,
  Mail,
  X,
  Save,
  UserCheck,
  UserX,
  Crown
} from 'lucide-react';
import Link from 'next/link';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  emailVerified: boolean;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  stats?: {
    totalOrders: number;
    totalSpent: number;
  };
  addresses?: {
    address: string;
    city: string;
    state: string;
    pinCode: string;
    country: string;
  }[];
}

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  emailVerified: boolean;
  isActive: boolean;
}



export default function AdminUsersPage() {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('users');

  // Handle URL parameters
  useEffect(() => {
    const action = searchParams.get('action');
    const role = searchParams.get('role');
    const view = searchParams.get('view');
    
    if (action === 'add') {
      setShowUserForm(true);
    }
    
    if (role) {
      setRoleFilter(role);
    }
    
    if (view) {
      setCurrentView(view);
    }
  }, [searchParams]);
  const [userFormData, setUserFormData] = useState<UserFormData>({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    emailVerified: false,
    isActive: true
  });

  // Fetch users on component mount
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchUsers();
    }
  }, [isAuthenticated, user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:5001/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUsers(data.data || []);
        } else {
          setError(data.message || 'Failed to fetch users');
        }
      } else {
        setError('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      const response = await fetch(`http://localhost:5001/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update the user in the local state
          setUsers(users.map(u => 
            u._id === userId ? { ...u, role: newRole } : u
          ));
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error updating user role:', error);
      return false;
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm));
    
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || 
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive) ||
      (statusFilter === 'verified' && user.emailVerified) ||
      (statusFilter === 'unverified' && !user.emailVerified);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Redirect if not admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="text-center bg-dark-card p-8 rounded-lg shadow-lg border border-gray-700">
          <h1 className="text-3xl font-bold text-dark-text mb-4">Access Denied</h1>
          <p className="text-dark-text-secondary mb-8">You need admin privileges to access this page.</p>
          <Link 
            href="/login?redirect=/admin/users" 
            className="bg-gradient-to-r from-primary to-light-green text-dark font-semibold px-6 py-3 rounded-lg hover:from-dark-green hover:to-primary transition-all"
          >
            Login as Admin
          </Link>
        </div>
      </div>
    );
  }

  const handleSaveUser = async () => {
    try {
      setLoading(true);
      
      if (editingUser) {
        // Update existing user
        const updatedUsers = users.map(u => 
          u._id === editingUser._id ? { ...u, ...userFormData, updatedAt: new Date().toISOString() } : u
        );
        setUsers(updatedUsers);
      } else {
        // Create new user
        const newUser: User = {
          _id: Date.now().toString(),
          ...userFormData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          stats: {
            totalOrders: 0,
            totalSpent: 0
          },
          addresses: []
        };
        setUsers([...users, newUser]);
      }
      
      setShowUserForm(false);
      setEditingUser(null);
      resetForm();
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      emailVerified: user.emailVerified,
      isActive: user.isActive
    });
    setShowUserForm(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u._id !== userId));
    }
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(users.map(u => 
      u._id === userId ? { ...u, isActive: !u.isActive } : u
    ));
  };

  const handlePromoteToAdmin = async (userId: string) => {
    if (window.confirm('Are you sure you want to promote this user to admin?')) {
      const success = await updateUserRole(userId, 'admin');
      if (success) {
        alert('User promoted to admin successfully!');
        // If the promoted user is the current user, refresh their data
        if (user && user.id === userId) {
          await refreshUser();
        }
      } else {
        alert('Failed to promote user to admin.');
      }
    }
  };

  const resetForm = () => {
    setUserFormData({
      name: '',
      email: '',
      phone: '',
      role: 'user',
      emailVerified: false,
      isActive: true
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-dark-text-secondary">Loading users...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center bg-dark-card p-8 rounded-lg shadow-lg border border-red-500">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
          <p className="text-dark-text-secondary mb-6">{error}</p>
          <button
            onClick={fetchUsers}
            className="bg-primary text-dark font-semibold px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <div className="bg-dark-card border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin" 
                className="text-dark-text-secondary hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-dark-text">User Management</h1>
                <p className="text-dark-text-secondary">Manage customer accounts and permissions</p>
              </div>
            </div>
            <button
              onClick={() => setShowUserForm(true)}
              className="bg-gradient-to-r from-primary to-light-green text-dark font-semibold px-6 py-3 rounded-lg hover:from-dark-green hover:to-primary transition-all flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add User</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm text-dark-text-secondary">Total Users</p>
                <p className="text-2xl font-bold text-dark-text">{users.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
            <div className="flex items-center">
              <UserCheck className="w-8 h-8 text-green-400" />
              <div className="ml-4">
                <p className="text-sm text-dark-text-secondary">Active Users</p>
                <p className="text-2xl font-bold text-dark-text">
                  {users.filter(u => u.isActive).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
            <div className="flex items-center">
              <Crown className="w-8 h-8 text-yellow-400" />
              <div className="ml-4">
                <p className="text-sm text-dark-text-secondary">Admin Users</p>
                <p className="text-2xl font-bold text-dark-text">
                  {users.filter(u => u.role === 'admin').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
            <div className="flex items-center">
              <Mail className="w-8 h-8 text-blue-400" />
              <div className="ml-4">
                <p className="text-sm text-dark-text-secondary">Verified Users</p>
                <p className="text-2xl font-bold text-dark-text">
                  {users.filter(u => u.emailVerified).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-dark-card p-6 rounded-lg border border-gray-700 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-dark-text-secondary" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-gray border border-gray-600 rounded-lg text-dark-text placeholder-dark-text-secondary focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 bg-dark-gray border border-gray-600 rounded-lg text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-dark-gray border border-gray-600 rounded-lg text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
            
            <button
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('');
                setStatusFilter('');
              }}
              className="px-4 py-2 border border-gray-600 text-dark-text-secondary hover:text-primary hover:border-primary rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-dark-card rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-dark-gray">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-hover-subtle hover:bg-opacity-20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-light-green flex items-center justify-center">
                            <span className="text-dark font-bold text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-dark-text">{user.name}</div>
                          <div className="text-sm text-dark-text-secondary">{user.email}</div>
                          {user.phone && (
                            <div className="text-xs text-dark-text-secondary">{user.phone}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'admin' && <Crown className="w-3 h-3 mr-1" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          user.emailVerified 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.emailVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text">
                      {user.stats?.totalOrders || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-text">
                      ₹{(user.stats?.totalSpent || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-primary hover:text-primary-dark transition-colors"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {user.role === 'user' && (
                          <button
                            onClick={() => handlePromoteToAdmin(user._id)}
                            className="text-yellow-400 hover:text-yellow-300 transition-colors"
                            title="Promote to Admin"
                          >
                            <Crown className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleUserStatus(user._id)}
                          className={`transition-colors ${
                            user.isActive 
                              ? 'text-red-400 hover:text-red-300' 
                              : 'text-green-400 hover:text-green-300'
                          }`}
                          title={user.isActive ? 'Deactivate User' : 'Activate User'}
                        >
                          {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Form Modal */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-300">
            <div className="p-6 border-b border-gray-300 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>
              <button
                onClick={() => {
                  setShowUserForm(false);
                  setEditingUser(null);
                  resetForm();
                }}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={userFormData.name}
                      onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={userFormData.email}
                      onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={userFormData.phone}
                      onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <select
                      value={userFormData.role}
                      onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as 'user' | 'admin' })}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={userFormData.isActive}
                      onChange={(e) => setUserFormData({ ...userFormData, isActive: e.target.checked })}
                      className="w-4 h-4 text-green-600 bg-white border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-700">Active Account</label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="emailVerified"
                      checked={userFormData.emailVerified}
                      onChange={(e) => setUserFormData({ ...userFormData, emailVerified: e.target.checked })}
                      className="w-4 h-4 text-green-600 bg-white border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                    />
                    <label htmlFor="emailVerified" className="text-sm text-gray-700">Email Verified</label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-300 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowUserForm(false);
                  setEditingUser(null);
                  resetForm();
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 hover:text-green-600 hover:border-green-500 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving...' : 'Save User'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}