const mongoose = require('mongoose');

const documentVersionSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  version: {
    type: Number,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  changes: {
    type: String,
    default: 'Initial version'
  }
}, {
  timestamps: true
});

const documentShareSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  permission: {
    type: String,
    enum: ['view', 'edit'],
    default: 'view'
  },
  sharedAt: {
    type: Date,
    default: Date.now
  }
});

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Document title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    default: ''
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isPrivate: {
    type: Boolean,
    default: true
  },
  collaborators: [documentShareSchema],
  versions: [documentVersionSchema],
  currentVersion: {
    type: Number,
    default: 1
  },
  tags: [{
    type: String,
    trim: true
  }],
  lastModified: {
    type: Date,
    default: Date.now
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  accessCount: {
    type: Number,
    default: 0
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for search functionality
documentSchema.index({ title: 'text', content: 'text' });

// Update lastModified when document is updated
documentSchema.pre('save', function(next) {
  this.lastModified = Date.now();
  next();
});

// Method to add a new version
documentSchema.methods.addVersion = function(content, userId, changes = 'Document updated') {
  this.currentVersion += 1;
  this.versions.push({
    content: this.content,
    version: this.currentVersion - 1,
    createdBy: userId,
    changes: changes
  });
  this.content = content;
  this.lastModifiedBy = userId;
  return this.save();
};

// Method to check if user has access
documentSchema.methods.hasAccess = function(userId) {
  if (this.isPublic) return true;
  if (this.author.toString() === userId.toString()) return true;
  
  const collaborator = this.collaborators.find(c => c.user.toString() === userId.toString());
  return !!collaborator;
};

// Method to check if user has edit permission
documentSchema.methods.canEdit = function(userId) {
  if (this.author.toString() === userId.toString()) return true;
  
  const collaborator = this.collaborators.find(c => c.user.toString() === userId.toString());
  return collaborator && collaborator.permission === 'edit';
};

// Method to add collaborator
documentSchema.methods.addCollaborator = function(userId, permission = 'view') {
  const existingIndex = this.collaborators.findIndex(c => c.user.toString() === userId.toString());
  
  if (existingIndex >= 0) {
    this.collaborators[existingIndex].permission = permission;
  } else {
    this.collaborators.push({
      user: userId,
      permission: permission
    });
  }
  
  return this.save();
};

// Method to remove collaborator
documentSchema.methods.removeCollaborator = function(userId) {
  this.collaborators = this.collaborators.filter(c => c.user.toString() !== userId.toString());
  return this.save();
};

// Static method to search documents
documentSchema.statics.searchDocuments = function(query, userId) {
  return this.find({
    $and: [
      { $text: { $search: query } },
      {
        $or: [
          { author: userId },
          { isPublic: true },
          { 'collaborators.user': userId }
        ]
      }
    ]
  }).populate('author', 'name email').populate('collaborators.user', 'name email');
};

module.exports = mongoose.model('Document', documentSchema); 