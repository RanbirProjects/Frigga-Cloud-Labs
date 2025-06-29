import React, { createContext, useContext, useReducer, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const DocumentContext = createContext();

const initialState = {
  documents: [],
  currentDocument: null,
  loading: false,
  error: null,
  isConnected: true, // Track connection status
  pagination: {
    current: 1,
    pages: 1,
    hasNext: false,
    hasPrev: false,
  },
};

const documentReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
        isConnected: action.payload === 'Network Error' ? false : state.isConnected,
      };
    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        isConnected: action.payload,
        error: action.payload ? null : state.error,
      };
    case 'GET_DOCUMENTS_SUCCESS':
      return {
        ...state,
        documents: action.payload.data,
        pagination: action.payload.pagination,
        loading: false,
        error: null,
        isConnected: true,
      };
    case 'GET_DOCUMENT_SUCCESS':
      return {
        ...state,
        currentDocument: action.payload,
        loading: false,
        error: null,
        isConnected: true,
      };
    case 'CREATE_DOCUMENT_SUCCESS':
      return {
        ...state,
        documents: [action.payload, ...state.documents],
        currentDocument: action.payload,
        loading: false,
        error: null,
        isConnected: true,
      };
    case 'UPDATE_DOCUMENT_SUCCESS':
      return {
        ...state,
        documents: state.documents.map(doc =>
          doc._id === action.payload._id ? action.payload : doc
        ),
        currentDocument: action.payload,
        loading: false,
        error: null,
        isConnected: true,
      };
    case 'DELETE_DOCUMENT_SUCCESS':
      return {
        ...state,
        documents: state.documents.filter(doc => doc._id !== action.payload),
        currentDocument: null,
        loading: false,
        error: null,
        isConnected: true,
      };
    case 'SEARCH_DOCUMENTS_SUCCESS':
      return {
        ...state,
        documents: action.payload.data,
        loading: false,
        error: null,
        isConnected: true,
      };
    case 'SHARE_DOCUMENT_SUCCESS':
      return {
        ...state,
        currentDocument: action.payload,
        loading: false,
        error: null,
        isConnected: true,
      };
    case 'CLEAR_CURRENT_DOCUMENT':
      return {
        ...state,
        currentDocument: null,
      };
    default:
      return state;
  }
};

export const DocumentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(documentReducer, initialState);
  const retryTimeoutRef = useRef(null);
  const lastErrorRef = useRef(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Error handler
  const handleError = useCallback((error, defaultMessage) => {
    const message = error.response?.data?.message || defaultMessage;
    dispatch({ type: 'SET_ERROR', payload: message });
    toast.error(message);
    lastErrorRef.current = message;
  }, []);

  // Get all documents
  const getDocuments = useCallback(async (page = 1, limit = 10) => {
    console.log('DocumentContext: Fetching documents...', { page, limit });
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await axios.get(`/api/documents?page=${page}&limit=${limit}`);
      console.log('DocumentContext: Documents fetched successfully:', res.data);
      dispatch({
        type: 'GET_DOCUMENTS_SUCCESS',
        payload: {
          data: res.data.data,
          pagination: res.data.pagination,
        },
      });
      lastErrorRef.current = null; // Clear error on success
    } catch (error) {
      console.error('DocumentContext: Error fetching documents:', error);
      handleError(error, 'Failed to fetch documents');
    }
  }, [handleError]);

  // Get single document
  const getDocument = useCallback(async (id) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await axios.get(`/api/documents/${id}`);
      dispatch({ type: 'GET_DOCUMENT_SUCCESS', payload: res.data.data });
      lastErrorRef.current = null;
    } catch (error) {
      handleError(error, 'Failed to fetch document');
    }
  }, [handleError]);

  // Create document
  const createDocument = async (formData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await axios.post('/api/documents', formData);
      dispatch({ type: 'CREATE_DOCUMENT_SUCCESS', payload: res.data.data });
      toast.success('Document created successfully!');
      lastErrorRef.current = null;
      
      // Refresh the documents list to show the new document
      await getDocuments();
      
      return { success: true, document: res.data.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create document';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, message };
    }
  };

  // Update document
  const updateDocument = async (id, formData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await axios.put(`/api/documents/${id}`, formData);
      dispatch({ type: 'UPDATE_DOCUMENT_SUCCESS', payload: res.data.data });
      toast.success('Document updated successfully!');
      lastErrorRef.current = null;
      return { success: true, document: res.data.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update document';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, message };
    }
  };

  // Delete document
  const deleteDocument = async (id) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await axios.delete(`/api/documents/${id}`);
      dispatch({ type: 'DELETE_DOCUMENT_SUCCESS', payload: id });
      toast.success('Document deleted successfully!');
      lastErrorRef.current = null;
      
      // Refresh the documents list to update the UI
      await getDocuments();
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete document';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, message };
    }
  };

  // Search documents
  const searchDocuments = async (query) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await axios.get(`/api/documents/search?q=${encodeURIComponent(query)}`);
      dispatch({ type: 'SEARCH_DOCUMENTS_SUCCESS', payload: res.data });
      lastErrorRef.current = null;
    } catch (error) {
      handleError(error, 'Search failed');
    }
  };

  // Share document
  const shareDocument = async (id, email, permission) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await axios.post(`/api/documents/${id}/share`, { email, permission });
      dispatch({ type: 'SHARE_DOCUMENT_SUCCESS', payload: res.data.data });
      toast.success(res.data.message);
      lastErrorRef.current = null;
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to share document';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, message };
    }
  };

  // Remove collaborator
  const removeCollaborator = async (documentId, userId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await axios.delete(`/api/documents/${documentId}/share/${userId}`);
      dispatch({ type: 'SHARE_DOCUMENT_SUCCESS', payload: res.data.data });
      toast.success(res.data.message);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove collaborator';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, message };
    }
  };

  // Get document versions
  const getDocumentVersions = async (id) => {
    try {
      const res = await axios.get(`/api/documents/${id}/versions`);
      return { success: true, versions: res.data.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch versions';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Restore document version
  const restoreVersion = async (documentId, versionId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await axios.post(`/api/documents/${documentId}/restore/${versionId}`);
      dispatch({ type: 'UPDATE_DOCUMENT_SUCCESS', payload: res.data.data });
      toast.success(res.data.message);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to restore version';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, message };
    }
  };

  // Clear current document
  const clearCurrentDocument = () => {
    dispatch({ type: 'CLEAR_CURRENT_DOCUMENT' });
  };

  const value = {
    documents: state.documents,
    currentDocument: state.currentDocument,
    loading: state.loading,
    error: state.error,
    pagination: state.pagination,
    isConnected: state.isConnected,
    getDocuments,
    getDocument,
    createDocument,
    updateDocument,
    deleteDocument,
    searchDocuments,
    shareDocument,
    removeCollaborator,
    getDocumentVersions,
    restoreVersion,
    clearCurrentDocument,
  };

  return <DocumentContext.Provider value={value}>{children}</DocumentContext.Provider>;
};

export const useDocument = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocument must be used within a DocumentProvider');
  }
  return context;
}; 