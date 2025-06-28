import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useDocument } from '../contexts/DocumentContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  PlusIcon, 
  DocumentTextIcon, 
  ClockIcon, 
  UserIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  StarIcon,
  ShareIcon,
  TrashIcon,
  EyeIcon,
  DocumentPlusIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  FolderIcon,
  TagIcon,
  CalendarIcon,
  ChartBarIcon,
  UsersIcon,
  BookOpenIcon,
  DocumentDuplicateIcon,
  ArchiveBoxIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import Button from './common/Button';
import LoadingSpinner from './common/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';

const Dashboard = () => {
  const { documents, loading, error, isConnected, createDocument, deleteDocument, getDocuments } = useDocument();
  const { user } = useAuth();
  
  // State for enhanced features
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'my', 'shared', 'public'
  const [sortBy, setSortBy] = useState('updated'); // 'updated', 'created', 'title', 'author'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    dateRange: 'all',
    tags: [],
    collaborators: [],
    status: 'all'
  });

  // Document templates
  const templates = [
    {
      id: 'blank',
      name: 'Blank Document',
      description: 'Start with a clean slate',
      icon: DocumentTextIcon,
      content: ''
    },
    {
      id: 'meeting-notes',
      name: 'Meeting Notes',
      description: 'Template for meeting documentation',
      icon: UsersIcon,
      content: `# Meeting Notes

## Date: ${new Date().toLocaleDateString()}
## Attendees: 
## Agenda:
1. 
2. 
3. 

## Discussion Points:
- 

## Action Items:
- [ ] 
- [ ] 
- [ ] 

## Next Meeting: 
`
    },
    {
      id: 'project-plan',
      name: 'Project Plan',
      description: 'Template for project planning',
      icon: ChartBarIcon,
      content: `# Project Plan

## Project Overview
**Project Name:** 
**Start Date:** 
**End Date:** 
**Project Manager:** 

## Objectives
1. 
2. 
3. 

## Timeline
### Phase 1: Planning
- [ ] 
- [ ] 

### Phase 2: Development
- [ ] 
- [ ] 

### Phase 3: Testing
- [ ] 
- [ ] 

### Phase 4: Deployment
- [ ] 
- [ ] 

## Resources
- Team Members:
- Budget:
- Tools:

## Risks & Mitigation
| Risk | Impact | Mitigation |
|------|--------|------------|
|      |        |            |
`
    },
    {
      id: 'research-paper',
      name: 'Research Paper',
      description: 'Template for academic writing',
      icon: BookOpenIcon,
      content: `# Research Paper

## Abstract

## Introduction

## Literature Review

## Methodology

## Results

## Discussion

## Conclusion

## References
1. 
2. 
3. 
`
    }
  ];

  useEffect(() => {
    if (user) {
      getDocuments();
    }
  }, [getDocuments, user]);

  // Filter and sort documents
  const filteredDocuments = documents?.filter(doc => {
    if (!doc || !doc.author) return false;
    const matchesSearch = (doc.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (doc.content?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (doc.tags || []).some(tag => (tag?.toLowerCase() || '').includes(searchTerm.toLowerCase()));
    const matchesFilter = filterType === 'all' ||
                         (filterType === 'my' && doc.author._id === user.id) ||
                         (filterType === 'shared' && (doc.collaborators?.length > 0)) ||
                         (filterType === 'public' && doc.isPublic);
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    if (!a || !b) return 0;
    switch (sortBy) {
      case 'title':
        return (a.title || '').localeCompare(b.title || '');
      case 'created':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'author':
        return (a.author?.name || '').localeCompare(b.author?.name || '');
      default:
        return new Date(b.lastModified) - new Date(a.lastModified);
    }
  }) || [];

  const handleCreateDocument = async (template = null) => {
    const result = await createDocument({
      title: template ? `${template.name} - ${new Date().toLocaleDateString()}` : 'Untitled Document',
      content: template ? template.content : '',
      isPublic: false,
      tags: template ? [template.id] : []
    });
    
    if (result.success) {
      setShowCreateModal(false);
      setShowTemplates(false);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedDocuments.length === 0) return;
    
    if (bulkAction === 'delete') {
      const confirmed = window.confirm(`Are you sure you want to delete ${selectedDocuments.length} document(s)?`);
      if (confirmed) {
        for (const docId of selectedDocuments) {
          await deleteDocument(docId);
        }
        setSelectedDocuments([]);
        setBulkAction('');
      }
    }
  };

  const toggleDocumentSelection = (docId) => {
    setSelectedDocuments(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const selectAllDocuments = () => {
    setSelectedDocuments(filteredDocuments.filter(doc => doc && doc._id).map(doc => doc._id));
  };

  const clearSelection = () => {
    setSelectedDocuments([]);
  };

  // Statistics
  const stats = {
    total: documents?.filter(doc => doc && doc._id).length || 0,
    myDocuments: documents?.filter(doc => doc && doc.author && doc.author._id === user.id).length || 0,
    sharedWithMe: documents?.filter(doc => doc && doc.collaborators && doc.collaborators.some(c => c.user && c.user._id === user.id)).length || 0,
    publicDocuments: documents?.filter(doc => doc && doc.isPublic).length || 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      {!isConnected && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800">Connection lost. Attempting to reconnect...</span>
          </div>
        </div>
      )}

      {/* Header with Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Document Dashboard</h1>
            <p className="text-gray-600">Manage and collaborate on your documents</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setShowTemplates(true)}
              variant="outline"
              className="flex items-center"
            >
              <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
              Templates
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Document
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Documents</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <DocumentTextIcon className="h-8 w-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">My Documents</p>
                <p className="text-2xl font-bold">{stats.myDocuments}</p>
              </div>
              <UserIcon className="h-8 w-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Shared with Me</p>
                <p className="text-2xl font-bold">{stats.sharedWithMe}</p>
              </div>
              <ShareIcon className="h-8 w-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Public Documents</p>
                <p className="text-2xl font-bold">{stats.publicDocuments}</p>
              </div>
              <EyeIcon className="h-8 w-8 opacity-80" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Documents</option>
              <option value="my">My Documents</option>
              <option value="shared">Shared with Me</option>
              <option value="public">Public Documents</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="updated">Last Modified</option>
              <option value="created">Date Created</option>
              <option value="title">Title</option>
              <option value="author">Author</option>
            </select>

            <Button
              variant="outline"
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              className="flex items-center"
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
              Advanced
            </Button>

            <div className="flex items-center space-x-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                onClick={() => setViewMode('grid')}
                size="sm"
              >
                <Squares2X2Icon className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
                size="sm"
              >
                <ListBulletIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Advanced Search */}
        {showAdvancedSearch && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select
                  value={advancedFilters.dateRange}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={advancedFilters.status}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <input
                  type="text"
                  placeholder="Filter by tags..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => setShowAdvancedSearch(false)}
                  variant="outline"
                  size="sm"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedDocuments.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-blue-800">
                {selectedDocuments.length} document(s) selected
              </span>
              <Button
                onClick={clearSelection}
                variant="outline"
                size="sm"
              >
                Clear Selection
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select Action</option>
                <option value="delete">Delete</option>
                <option value="export">Export</option>
                <option value="archive">Archive</option>
              </select>
              <Button
                onClick={handleBulkAction}
                disabled={!bulkAction}
                size="sm"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Documents Grid/List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first document'
              }
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Document
            </Button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6' : 'divide-y divide-gray-200'}>
            {filteredDocuments.filter(doc => doc && doc._id).map((doc) => (
              <div
                key={doc._id}
                className={`relative group ${
                  viewMode === 'grid' 
                    ? 'bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow' 
                    : 'p-4 hover:bg-gray-50'
                }`}
              >
                {/* Selection Checkbox */}
                <div className="absolute top-2 left-2">
                  <input
                    type="checkbox"
                    checked={selectedDocuments.includes(doc._id)}
                    onChange={() => toggleDocumentSelection(doc._id)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </div>

                <div className={viewMode === 'grid' ? 'space-y-3' : 'flex items-center justify-between'}>
                  <div className={viewMode === 'grid' ? 'space-y-2' : 'flex-1'}>
                    <div className="flex items-start justify-between">
                      <h3 className={`font-medium text-gray-900 ${viewMode === 'grid' ? 'text-lg' : 'text-base'} line-clamp-2`}>
                        {doc.title}
                      </h3>
                      {viewMode === 'list' && (
                        <div className="flex items-center space-x-2 ml-4">
                          {doc.isPublic && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Public
                            </span>
                          )}
                          {doc.collaborators && doc.collaborators.length > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Shared
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {doc.content.substring(0, 100)}...
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <UserIcon className="h-3 w-3 mr-1" />
                        {doc.author && doc.author.name}
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {formatDistanceToNow(new Date(doc.lastModified), { addSuffix: true })}
                      </div>
                    </div>

                    {/* Tags */}
                    {doc.tags && doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {doc.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            <TagIcon className="h-3 w-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                        {doc.tags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{doc.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className={`flex items-center space-x-2 ${viewMode === 'grid' ? 'justify-end' : 'ml-4'}`}>
                    <Link
                      to={`/document/${doc._id}`}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => {/* Share functionality */}}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ShareIcon className="h-4 w-4" />
                    </button>
                    {doc.author && doc.author._id === user.id && (
                      <button
                        onClick={() => deleteDocument(doc._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Document Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Document</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  placeholder="Enter document title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Content
                </label>
                <textarea
                  placeholder="Start writing your document..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => handleCreateDocument()}
                  className="flex-1"
                >
                  Create Document
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Choose a Template</h2>
              <Button
                variant="outline"
                onClick={() => setShowTemplates(false)}
              >
                Close
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleCreateDocument(template)}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <template.icon className="h-6 w-6 text-primary-600" />
                    <h3 className="font-medium text-gray-900">{template.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <Button size="sm" className="w-full">
                    Use Template
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 