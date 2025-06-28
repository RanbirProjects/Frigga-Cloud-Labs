import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocument } from '../contexts/DocumentContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeftIcon,
  CheckIcon,
  ShareIcon,
  ClockIcon,
  UserIcon,
  ChatBubbleLeftIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  EyeSlashIcon,
  TagIcon,
  BookmarkIcon,
  CloudArrowUpIcon,
  UsersIcon,
  CogIcon,
  DocumentTextIcon,
  CalendarIcon,
  StarIcon,
  TrashIcon,
  PencilIcon,
  LockClosedIcon,
  LockOpenIcon
} from '@heroicons/react/24/outline';
import Button from './common/Button';
import LoadingSpinner from './common/LoadingSpinner';
import ShareDocumentModal from './ShareDocumentModal';
import { formatDistanceToNow } from 'date-fns';

// Enhanced TipTap Editor Component with real-time features
const TipTapEditor = ({ content, onChange, editable = true, collaborators = [] }) => {
  const [editorContent, setEditorContent] = useState(content);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    setEditorContent(content);
  }, [content]);

  const handleChange = (e) => {
    const newContent = e.target.value;
    setEditorContent(newContent);
    onChange(newContent);
    
    // Debounced typing indicator
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  if (!editable) {
    return (
      <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto max-w-none">
        <div 
          className="min-h-[400px] p-4 border border-gray-200 rounded-lg bg-white"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      {/* Editor Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <DocumentTextIcon className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">Document Editor</span>
        </div>
        <div className="flex items-center space-x-2">
          {isTyping && (
            <div className="flex items-center text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
              Typing...
            </div>
          )}
          {collaborators.length > 0 && (
            <div className="flex items-center text-xs text-gray-500">
              <UsersIcon className="h-3 w-3 mr-1" />
              {collaborators.length} collaborator{collaborators.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
      
      <textarea
        value={editorContent}
        onChange={handleChange}
        className="w-full min-h-[400px] p-4 resize-none border-0 focus:outline-none focus:ring-0"
        placeholder="Start writing your document..."
      />
    </div>
  );
};

// Comments Component
const CommentsSection = ({ comments = [], onAddComment, currentUser }) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Comments</h3>
      </div>
      
      <div className="p-4 space-y-4 max-h-64 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No comments yet</p>
        ) : (
          comments.map((comment, index) => (
            <div key={index} className="flex space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-primary-600" />
                </div>
              </div>
              <div className="flex-1">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {comment.author.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <form onSubmit={handleSubmitComment} className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <Button type="submit" size="sm" disabled={!newComment.trim()}>
            Post
          </Button>
        </div>
      </form>
    </div>
  );
};

// Version History Component
const VersionHistory = ({ versions = [], onRestoreVersion }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Version History</h3>
      </div>
      
      <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
        {versions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No previous versions</p>
        ) : (
          versions.map((version, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <DocumentDuplicateIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Version {versions.length - index}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })} by {version.author.name}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRestoreVersion(version)}
              >
                Restore
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const DocumentEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentDocument, loading, getDocument, updateDocument } = useDocument();
  const { user } = useAuth();
  
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [comments, setComments] = useState([]);
  const [versions, setVersions] = useState([]);
  const [autoSave, setAutoSave] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);

  useEffect(() => {
    if (id) {
      getDocument(id);
    }
  }, [id, getDocument]);

  useEffect(() => {
    if (currentDocument) {
      setContent(currentDocument.content || '');
      setTitle(currentDocument.title || '');
      setIsPublic(currentDocument.isPublic || false);
      setTags(currentDocument.tags ? currentDocument.tags.join(', ') : '');
      setComments(currentDocument.comments || []);
      setVersions(currentDocument.versions || []);
      
      // Calculate word and character count
      const words = content.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
      setCharacterCount(content.length);
    }
  }, [currentDocument, content]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !currentDocument || !content) return;
    
    const autoSaveTimeout = setTimeout(() => {
      handleSave();
    }, 3000);
    
    return () => clearTimeout(autoSaveTimeout);
  }, [content, autoSave]);

  const handleSave = async () => {
    if (!currentDocument) return;

    setSaving(true);
    const result = await updateDocument(currentDocument._id, {
      title,
      content,
      isPublic,
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    });
    setSaving(false);

    if (result.success) {
      setLastSaved(new Date());
    }
  };

  const handleAddComment = (commentText) => {
    const newComment = {
      id: Date.now(),
      content: commentText,
      author: { name: user.username, id: user.id },
      createdAt: new Date().toISOString()
    };
    setComments(prev => [...prev, newComment]);
  };

  const handleRestoreVersion = (version) => {
    if (window.confirm('Are you sure you want to restore this version? Current changes will be lost.')) {
      setContent(version.content);
      setTitle(version.title);
      handleSave();
    }
  };

  const canEdit = currentDocument && (
    currentDocument.author._id === user.id ||
    currentDocument.collaborators.some(c => c.user._id === user.id && c.permission === 'edit')
  );

  const canView = currentDocument && (
    currentDocument.author._id === user.id ||
    currentDocument.collaborators.some(c => c.user._id === user.id) ||
    currentDocument.isPublic
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentDocument) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Document not found</h3>
        <p className="mt-1 text-sm text-gray-500">The document you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/dashboard')} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="text-center py-12">
        <LockClosedIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Access Denied</h3>
        <p className="mt-1 text-sm text-gray-500">You don't have permission to view this document.</p>
        <Button onClick={() => navigate('/dashboard')} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="flex items-center"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{currentDocument.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
              <div className="flex items-center">
                <UserIcon className="h-4 w-4 mr-1" />
                {currentDocument.author.name}
              </div>
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                {formatDistanceToNow(new Date(currentDocument.lastModified), { addSuffix: true })}
              </div>
              {lastSaved && (
                <span className="text-green-600">
                  Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
                </span>
              )}
              <div className="flex items-center">
                <DocumentTextIcon className="h-4 w-4 mr-1" />
                {wordCount} words, {characterCount} characters
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {canEdit && (
            <Button
              onClick={handleSave}
              loading={saving}
              disabled={saving}
              className="flex items-center"
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              Save
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center"
          >
            <ChatBubbleLeftIcon className="h-4 w-4 mr-2" />
            Comments
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowVersions(!showVersions)}
            className="flex items-center"
          >
            <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
            History
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center"
          >
            <CogIcon className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowShareModal(true)}
            className="flex items-center"
          >
            <ShareIcon className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-3 space-y-6">
          {/* Document Settings (for editors) */}
          {canEdit && (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Document Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Enter tags separated by commas"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                    Make document public
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Editor */}
          <TipTapEditor
            content={content}
            onChange={setContent}
            editable={canEdit}
            collaborators={currentDocument.collaborators || []}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Document Info */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Document Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  currentDocument.isPublic 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {currentDocument.isPublic ? 'Public' : 'Private'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="text-gray-900">
                  {formatDistanceToNow(new Date(currentDocument.createdAt), { addSuffix: true })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Modified:</span>
                <span className="text-gray-900">
                  {formatDistanceToNow(new Date(currentDocument.lastModified), { addSuffix: true })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Collaborators:</span>
                <span className="text-gray-900">
                  {currentDocument.collaborators?.length || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {currentDocument.tags && currentDocument.tags.length > 0 && (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {currentDocument.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    <TagIcon className="h-3 w-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Collaborators */}
          {currentDocument.collaborators && currentDocument.collaborators.length > 0 && (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Collaborators</h3>
              <div className="space-y-2">
                {currentDocument.collaborators.map((collaborator, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                        <UserIcon className="h-3 w-3 text-primary-600" />
                      </div>
                      <span className="text-sm text-gray-900">{collaborator.user.name}</span>
                    </div>
                    <span className="text-xs text-gray-500 capitalize">{collaborator.permission}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          {showComments && (
            <CommentsSection
              comments={comments}
              onAddComment={handleAddComment}
              currentUser={user}
            />
          )}

          {/* Version History */}
          {showVersions && (
            <VersionHistory
              versions={versions}
              onRestoreVersion={handleRestoreVersion}
            />
          )}

          {/* Settings */}
          {showSettings && canEdit && (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Editor Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Auto-save</span>
                  <input
                    type="checkbox"
                    checked={autoSave}
                    onChange={(e) => setAutoSave(e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Word count</span>
                  <span className="text-sm font-medium text-gray-900">{wordCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Character count</span>
                  <span className="text-sm font-medium text-gray-900">{characterCount}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareDocumentModal
          document={currentDocument}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};

export default DocumentEditor; 