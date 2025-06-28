const express = require('express');
const { body, validationResult } = require('express-validator');
const Document = require('../models/Document');
const User = require('../models/User');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/documents
// @desc    Get all documents for user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const documents = await Document.find({
      $or: [
        { author: req.user.id },
        { isPublic: true },
        { 'collaborators.user': req.user.id }
      ]
    })
    .populate('author', 'name email')
    .populate('lastModifiedBy', 'name email')
    .populate('collaborators.user', 'name email')
    .sort({ lastModified: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Document.countDocuments({
      $or: [
        { author: req.user.id },
        { isPublic: true },
        { 'collaborators.user': req.user.id }
      ]
    });

    res.json({
      success: true,
      count: documents.length,
      total,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      data: documents
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/documents/search
// @desc    Search documents
// @access  Private
router.get('/search', protect, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const documents = await Document.searchDocuments(q, req.user.id);

    res.json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/documents/:id
// @desc    Get single document
// @access  Private/Public (if public document)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('author', 'name email')
      .populate('lastModifiedBy', 'name email')
      .populate('collaborators.user', 'name email')
      .populate('versions.createdBy', 'name email');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check access
    if (!document.hasAccess(req.user?.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Increment access count if user is authenticated
    if (req.user) {
      document.accessCount += 1;
      await document.save();
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/documents
// @desc    Create new document
// @access  Private
router.post('/', protect, [
  body('title', 'Title is required').not().isEmpty(),
  body('content').optional(),
  body('isPublic').optional().isBoolean(),
  body('tags').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { title, content = '', isPublic = false, tags = [] } = req.body;

    const document = new Document({
      title,
      content,
      author: req.user.id,
      isPublic,
      tags,
      lastModifiedBy: req.user.id
    });

    // Add initial version
    document.versions.push({
      content: content,
      version: 1,
      createdBy: req.user.id,
      changes: 'Initial version'
    });

    await document.save();

    const populatedDocument = await Document.findById(document._id)
      .populate('author', 'name email')
      .populate('lastModifiedBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedDocument
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/documents/:id
// @desc    Update document
// @access  Private
router.put('/:id', protect, [
  body('title').optional().not().isEmpty(),
  body('content').optional(),
  body('isPublic').optional().isBoolean(),
  body('tags').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check edit permission
    if (!document.canEdit(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Edit permission denied'
      });
    }

    const { title, content, isPublic, tags } = req.body;
    const changes = [];

    if (title && title !== document.title) {
      document.title = title;
      changes.push('Title updated');
    }

    if (content !== undefined && content !== document.content) {
      // Add new version if content changed
      await document.addVersion(content, req.user.id, 'Content updated');
      changes.push('Content updated');
    }

    if (isPublic !== undefined && isPublic !== document.isPublic) {
      document.isPublic = isPublic;
      changes.push('Visibility updated');
    }

    if (tags !== undefined) {
      document.tags = tags;
      changes.push('Tags updated');
    }

    if (changes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No changes detected'
      });
    }

    await document.save();

    const updatedDocument = await Document.findById(document._id)
      .populate('author', 'name email')
      .populate('lastModifiedBy', 'name email')
      .populate('collaborators.user', 'name email')
      .populate('versions.createdBy', 'name email');

    res.json({
      success: true,
      data: updatedDocument,
      changes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/documents/:id
// @desc    Delete document
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check if user is author
    if (document.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Delete permission denied'
      });
    }

    await document.remove();

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/documents/:id/share
// @desc    Share document with user
// @access  Private
router.post('/:id/share', protect, [
  body('email', 'Email is required').isEmail(),
  body('permission', 'Permission must be view or edit').isIn(['view', 'edit'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check if user is author
    if (document.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Share permission denied'
      });
    }

    const { email, permission } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't share with yourself
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot share document with yourself'
      });
    }

    await document.addCollaborator(user._id, permission);

    const updatedDocument = await Document.findById(document._id)
      .populate('author', 'name email')
      .populate('collaborators.user', 'name email');

    res.json({
      success: true,
      data: updatedDocument,
      message: `Document shared with ${user.name}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/documents/:id/share/:userId
// @desc    Remove user from document sharing
// @access  Private
router.delete('/:id/share/:userId', protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check if user is author
    if (document.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Share permission denied'
      });
    }

    await document.removeCollaborator(req.params.userId);

    const updatedDocument = await Document.findById(document._id)
      .populate('author', 'name email')
      .populate('collaborators.user', 'name email');

    res.json({
      success: true,
      data: updatedDocument,
      message: 'User removed from document sharing'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/documents/:id/versions
// @desc    Get document versions
// @access  Private
router.get('/:id/versions', protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('versions.createdBy', 'name email');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check access
    if (!document.hasAccess(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: document.versions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/documents/:id/restore/:versionId
// @desc    Restore document to specific version
// @access  Private
router.post('/:id/restore/:versionId', protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check edit permission
    if (!document.canEdit(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Edit permission denied'
      });
    }

    const version = document.versions.find(v => v._id.toString() === req.params.versionId);
    if (!version) {
      return res.status(404).json({
        success: false,
        message: 'Version not found'
      });
    }

    // Add current content as new version
    await document.addVersion(version.content, req.user.id, `Restored to version ${version.version}`);

    const updatedDocument = await Document.findById(document._id)
      .populate('author', 'name email')
      .populate('lastModifiedBy', 'name email')
      .populate('versions.createdBy', 'name email');

    res.json({
      success: true,
      data: updatedDocument,
      message: `Document restored to version ${version.version}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 