const mongoose = require('mongoose');

// Define suggested tags (moved to a constant for reusability)
const SUGGESTED_TAGS = [
  'prescription',
  'lab_results',
  'vaccination',
  'exam_notes',
  'insurance',
  'invoice',
  'other'
];

const documentSchema = new mongoose.Schema({
  // File information
  name: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true
  },
  s3Key: {
    type: String,
    required: true,
    unique: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  
  // Relationships
  pet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  originalVet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vet'
  },
  
  // Organization
  tags: [{
    type: String,
    trim: true
  }],
  
  // Status tracking
  status: {
    type: String,
    enum: ['PROCESSING', 'ACTIVE', 'ERROR', 'ARCHIVED'],
    default: 'PROCESSING'
  },
  processingError: String,
  
  // Auto-managed dates
  uploadDate: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,
  
  // Enable virtuals in JSON
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  
  // Add indexes for common queries
  indexes: [
    { name: 'text' },
    { tags: 1 },
    { status: 1 },
    { uploadDate: -1 },
    { pet: 1, status: 1 }
  ]
});

// Virtual for presigned URL
documentSchema.virtual('url').get(function() {
  return this._url;
});

// Clean up JSON output
documentSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

const Document = mongoose.model('Document', documentSchema);

module.exports = {
  Document,
  SUGGESTED_TAGS
};