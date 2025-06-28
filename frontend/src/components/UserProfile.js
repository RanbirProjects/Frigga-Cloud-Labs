import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDocument } from '../contexts/DocumentContext';
import { 
  UserIcon,
  DocumentTextIcon,
  ClockIcon,
  StarIcon,
  ShareIcon,
  EyeIcon,
  CogIcon,
  KeyIcon,
  EnvelopeIcon,
  CalendarIcon,
  ChartBarIcon,
  TrophyIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Button from './common/Button';
import LoadingSpinner from './common/LoadingSpinner';

const UserProfile = () => {
  const { user, updateProfile } = useAuth();
  const { documents } = useDocument();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    avatar: user?.avatar || ''
  });

  // User statistics
  const stats = {
    totalDocuments: documents?.length || 0,
    myDocuments: documents?.filter(doc => doc.author._id === user?.id).length || 0,
    sharedDocuments: documents?.filter(doc => doc.collaborators.some(c => c.user._id === user?.id)).length || 0,
    publicDocuments: documents?.filter(doc => doc.isPublic).length || 0,
    totalCollaborators: documents?.reduce((acc, doc) => acc + (doc.collaborators?.length || 0), 0) || 0
  };

  // Recent activity
  const recentActivity = documents?.slice(0, 5).map(doc => ({
    id: doc._id,
    type: 'document_updated',
    title: doc.title,
    timestamp: doc.lastModified,
    description: `Updated ${doc.title}`
  })) || [];

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile(profileData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setProfileData({
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || '',
      avatar: user?.avatar || ''
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
            <p className="text-gray-600">Manage your account and preferences</p>
          </div>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "outline" : "default"}
            className="flex items-center"
          >
            {isEditing ? (
              <>
                <XMarkIcon className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.username}
                    onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{user.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{user.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-900">{user.bio || 'No bio added yet.'}</p>
                )}
              </div>

              {isEditing && (
                <div className="flex items-center space-x-3 pt-4">
                  <Button
                    onClick={handleSave}
                    loading={loading}
                    className="flex items-center"
                  >
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Your Statistics</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <DocumentTextIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{stats.totalDocuments}</p>
                <p className="text-sm text-gray-600">Total Documents</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <UserIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{stats.myDocuments}</p>
                <p className="text-sm text-gray-600">My Documents</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <ShareIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">{stats.sharedDocuments}</p>
                <p className="text-sm text-gray-600">Shared with Me</p>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <EyeIcon className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-600">{stats.publicDocuments}</p>
                <p className="text-sm text-gray-600">Public Documents</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
            
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent activity</p>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <DocumentTextIcon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Avatar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Picture</h2>
            
            <div className="text-center">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="h-12 w-12 text-primary-600" />
              </div>
              {isEditing && (
                <Button variant="outline" size="sm">
                  Change Picture
                </Button>
              )}
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Account Information</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Member since:</span>
                <span className="text-gray-900">
                  {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Last login:</span>
                <span className="text-gray-900">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Account status:</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <KeyIcon className="h-4 w-4 mr-2" />
                Change Password
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <CogIcon className="h-4 w-4 mr-2" />
                Account Settings
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <EnvelopeIcon className="h-4 w-4 mr-2" />
                Email Preferences
              </Button>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Achievements</h2>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <TrophyIcon className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">First Document</p>
                  <p className="text-xs text-gray-500">Created your first document</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <StarIcon className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Collaborator</p>
                  <p className="text-xs text-gray-500">Shared a document with others</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 opacity-50">
                <ChartBarIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Power User</p>
                  <p className="text-xs text-gray-400">Create 10+ documents</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 