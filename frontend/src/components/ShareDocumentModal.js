import React, { useState } from 'react';
import { useDocument } from '../contexts/DocumentContext';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import Button from './common/Button';
import Input from './common/Input';

const ShareDocumentModal = ({ isOpen, onClose, document }) => {
  const [formData, setFormData] = useState({
    email: '',
    permission: 'view'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { shareDocument, removeCollaborator } = useDocument();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const result = await shareDocument(document._id, formData.email, formData.permission);
    setLoading(false);

    if (result.success) {
      setFormData({ email: '', permission: 'view' });
      setErrors({});
    }
  };

  const handleRemoveCollaborator = async (userId) => {
    if (window.confirm('Are you sure you want to remove this collaborator?')) {
      await removeCollaborator(document._id, userId);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ email: '', permission: 'view' });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose} />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Share Document
              </h3>
              <button
                type="button"
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={handleClose}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">{document.title}</h4>
              <p className="text-sm text-gray-500">
                {document.isPublic ? 'Public document' : 'Private document'}
              </p>
            </div>

            {/* Current Collaborators */}
            {document.collaborators && document.collaborators.length > 0 && (
              <div className="mb-6">
                <h5 className="text-sm font-medium text-gray-900 mb-3">Current Collaborators</h5>
                <div className="space-y-2">
                  {document.collaborators.map((collaborator) => (
                    <div key={collaborator.user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{collaborator.user.name}</p>
                        <p className="text-xs text-gray-500">{collaborator.user.email}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          collaborator.permission === 'edit' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {collaborator.permission === 'edit' ? 'Editor' : 'Viewer'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveCollaborator(collaborator.user._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Add New Collaborator */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="Enter email address"
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permission
                </label>
                <select
                  name="permission"
                  value={formData.permission}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="view">View only</option>
                  <option value="edit">Can edit</option>
                </select>
              </div>
            </form>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <Button
              type="submit"
              onClick={handleSubmit}
              loading={loading}
              disabled={loading}
              className="w-full sm:w-auto sm:ml-3"
            >
              Share Document
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
              className="mt-3 w-full sm:mt-0 sm:w-auto"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareDocumentModal; 