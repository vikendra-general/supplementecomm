'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  totalOrders: number;
  totalSpent: number;
  addresses?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
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

// Mock user data
const mockUsers: User[] = [
  {
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+91 9876543210',
    role: 'user',
    emailVerified: true,
    isActive: true,
    lastLogin: '2024-01-22T10:30:00Z',
    createdAt: '2023-12-01T08:00:00Z',
    totalOrders: 5,
    totalSpent: 2500.50,
    addresses: [
      {
        address: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India'
      }
    ]
  },
  {
    _id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+91 9876543211',
    role: 'user',
    emailVerified: true,
    isActive: true,
    lastLogin: '2024-01-21T14:15:00Z',
    createdAt: '2023-11-15T12:30:00Z',
    totalOrders: 3,
    totalSpent: 1200.75,
    addresses: [
      {
        address: '456 Park Avenue',
        city: 'Delhi',
        state: 'Delhi',
        zipCode: '110001',
        country: 'India'
      }
    ]
  },
  {
    _id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    phone: '+91 9876543212',
    role: 'user',
    emailVerified: false,
    isActive: true,
    lastLogin: '2024-01-20T09:45:00Z',
    createdAt: '2024-01-10T16:20:00Z',
    totalOrders: 1,
    totalSpent: 599.99,
    addresses: []
  },
  {
    _id: '4',
    name: 'Admin User',
    email: 'admin@bbn-nutrition.com',
    phone: '+91 9876543213',
    role: 'admin',
    emailVerified: true,
    isActive: true,
    lastLogin: '2024-01-22T11:00:00Z',
    createdAt: '2023-10-01T10:00:00Z',
    totalOrders: 0,
    totalSpent: 0,
    addresses: []
  },
  {
    _id: '5',
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    phone: '+91 9876543214',
    role: 'user',
    emailVerified: true,
    isActive: false,
    lastLogin: '2023-12-15T08:30:00Z',
    createdAt: '2023-09-20T14:45:00Z',
    totalOrders: 8,
    totalSpent: 4200.25,
    addresses: [
      {
        address: '789 Tech Park',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560001',
        country: 'India'
      }
    ]
  }
];

export default function AdminUsersPage() {
  const { user, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState<UserFormData>({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    emailVerified: false,
    isActive: true
  });

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
          totalOrders: 0,
          totalSpent: 0,
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
                      {user.totalOrders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-text">
                      ₹{user.totalSpent.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-primary hover:text-primary-dark transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(user._id)}
                          className={`transition-colors ${
                            user.isActive 
                              ? 'text-red-400 hover:text-red-300' 
                              : 'text-green-400 hover:text-green-300'
                          }`}
                        >
                          {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-dark-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-700">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-dark-text">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>
              <button
                onClick={() => {
                  setShowUserForm(false);
                  setEditingUser(null);
                  resetForm();
                }}
                className="p-2 rounded-full hover:bg-hover-subtle hover:bg-opacity-20 transition-colors"
              >
                <X className="w-6 h-6 text-dark-text-secondary" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-text mb-2">Full Name</label>
                    <input
                      type="text"
                      value={userFormData.name}
                      onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-gray border border-gray-600 rounded-lg text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-dark-text mb-2">Email Address</label>
                    <input
                      type="email"
                      value={userFormData.email}
                      onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-gray border border-gray-600 rounded-lg text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-text mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={userFormData.phone}
                      onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-gray border border-gray-600 rounded-lg text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-dark-text mb-2">Role</label>
                    <select
                      value={userFormData.role}
                      onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as 'user' | 'admin' })}
                      className="w-full px-4 py-2 bg-dark-gray border border-gray-600 rounded-lg text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-dark-text">Account Settings</h3>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={userFormData.isActive}
                      onChange={(e) => setUserFormData({ ...userFormData, isActive: e.target.checked })}
                      className="w-4 h-4 text-primary bg-dark-gray border-gray-600 rounded focus:ring-primary focus:ring-2"
                    />
                    <label htmlFor="isActive" className="text-sm text-dark-text">Active Account</label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="emailVerified"
                      checked={userFormData.emailVerified}
                      onChange={(e) => setUserFormData({ ...userFormData, emailVerified: e.target.checked })}
                      className="w-4 h-4 text-primary bg-dark-gray border-gray-600 rounded focus:ring-primary focus:ring-2"
                    />
                    <label htmlFor="emailVerified" className="text-sm text-dark-text">Email Verified</label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-700 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowUserForm(false);
                  setEditingUser(null);
                  resetForm();
                }}
                className="px-6 py-2 border border-gray-600 text-dark-text-secondary hover:text-primary hover:border-primary rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                disabled={loading}
                className="bg-gradient-to-r from-primary to-light-green text-dark font-semibold px-6 py-2 rounded-lg hover:from-dark-green hover:to-primary transition-all flex items-center space-x-2 disabled:opacity-50"
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