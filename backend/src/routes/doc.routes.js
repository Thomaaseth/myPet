const express = require('express');
const router = express.Router();
const { Document, SUGGESTED_TAGS } = require('../models/Document.model');
const Pet = require('../models/Pet.model');
const s3Service = require('../services/s3.service');
const { isAuthenticated } = require('../middleware/jwt.middleware');
const mongoose = require('mongoose');


// Get upload URL for a pet's document
router.post('/pets/:petId/documents/upload-url', isAuthenticated, async (req, res) => {
  try {
    const { petId } = req.params;
    const { filename, fileType, fileSize } = req.body;

    if (!mongoose.Types.ObjectId.isValid(petId)) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    // Verify pet belongs to user
    const pet = await Pet.findOne({ _id: petId, user: req.user._id });
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    const { uploadUrl, s3Key } = await s3Service.getUploadUrl(
      petId,
      filename,
      fileType,
      fileSize
    );

    res.json({ 
      uploadUrl,
      s3Key,
      suggestedTags: SUGGESTED_TAGS
    });
  } catch (error) {
    console.error('Upload URL error:', error);
    res.status(500).json({ message: 'Error generating upload URL' });
  }
});

// Confirm upload and create document record for a pet
router.post('/pets/:petId/documents', isAuthenticated, async (req, res) => {
  try {
    const { petId } = req.params;
    const { 
      name,
      originalName,
      s3Key,
      mimeType,
      size,
      originalVet,
      tags 
    } = req.body;

    // Verify pet belongs to user
    const pet = await Pet.findOne({ _id: petId, user: req.user._id });
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    // Verify file exists in S3
    const fileExists = await s3Service.fileExists(s3Key);
    if (!fileExists) {
      return res.status(400).json({ message: 'File upload incomplete or failed' });
    }

    const document = await Document.create({
      name,
      originalName,
      s3Key,
      mimeType,
      size,
      pet: petId,
      originalVet,
      tags,
      status: 'ACTIVE'
    });

    // Get presigned URL for immediate use
    document._url = await s3Service.getViewUrl(s3Key);

    res.status(201).json({
      message: 'Document created successfully',
      document
    });
  } catch (error) {
    console.error('Document creation error:', error);
    res.status(500).json({ message: 'Error creating document record' });
  }
});

// Get all documents for a pet
router.get('/pets/:petId/documents', isAuthenticated, async (req, res) => {
  try {
    const { petId } = req.params;
    const { search, tags, status = 'ACTIVE' } = req.query;

    // Verify pet belongs to user
    const pet = await Pet.findOne({ _id: petId, user: req.user._id });
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    // Build query
    const query = { 
      pet: petId,
      status
    };

    // Add search if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { originalName: { $regex: search, $options: 'i' } }
      ];
    }

    // Add tags filter if provided
    if (tags) {
      const tagArray = tags.split(',');
      query.tags = { $all: tagArray };
    }

    const documents = await Document.find(query)
      .populate('originalVet', 'clinicName vetName')
      .sort({ uploadDate: -1 });

    // Generate presigned URLs for all documents
    for (const doc of documents) {
      doc._url = await s3Service.getViewUrl(doc.s3Key);
    }

    res.json({
      count: documents.length,
      documents
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: 'Error fetching documents' });
  }
});

// Get single document of a pet
router.get('/pets/:petId/documents/:documentId', isAuthenticated, async (req, res) => {
  try {
    const { petId, documentId } = req.params;

    // Verify pet belongs to user
    const pet = await Pet.findOne({ _id: petId, user: req.user._id });
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    const document = await Document.findOne({
      _id: documentId,
      pet: petId
    }).populate('originalVet', 'clinicName vetName');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Generate presigned URL
    document._url = await s3Service.getViewUrl(document.s3Key);

    res.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ message: 'Error fetching document' });
  }
});

// Update document(s) metadata for a pet
router.put('/pets/:petId/documents/update', isAuthenticated, async (req, res) => {
  try {
    const { petId } = req.params;
    const { updates } = req.body;

    // Validate inputs
    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: 'No updates specified' });
    }

    // Verify pet belongs to user
    const pet = await Pet.findOne({ _id: petId, user: req.user._id });
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    // Process each update
    const updatedDocuments = await Promise.all(
      updates.map(async (updateItem) => {
        const { documentId, ...updateData } = updateItem;
        console.log('Processing update for document:', documentId);
        console.log('Update data:', JSON.stringify(updateData, null, 2));

        // Skip if no documentId
        if (!documentId) {
          return null;
        }

        // Validate name if provided
        if (updateData.name !== undefined && !updateData.name.trim()) {
          return null;
        }

        // Create a clean update object
        const cleanUpdate = { $set: {} };
        
        // Handle tags
        if (Array.isArray(updateData.tags)) {
          const cleanTags = updateData.tags
          .filter(tag => typeof tag === 'string')
          .map(tag => String(tag));
                  
          if (cleanTags.length > 0) {
          cleanUpdate.$set.tags = cleanTags;
          }
          }
        
          // Handle name
          if (updateData.name && typeof updateData.name === 'string') {
          const cleanName = updateData.name.trim();
          if (cleanName) {
          cleanUpdate.$set.name = cleanName;
          }
          }
        
          console.log('Clean update object:', JSON.stringify(cleanUpdate, null, 2));
        
        
        // Skip update if no valid fields to update
        if (Object.keys(cleanUpdate.$set).length === 0) {
          return null;
        }

        console.log('Performing update with:', JSON.stringify(cleanUpdate, null, 2)); // Add this log

        // Find and update document
        const document = await Document.findOneAndUpdate(
          {
            _id: documentId,
            pet: petId
          },
          cleanUpdate,
          { 
            new: true,
            runValidators: true
          }
        ).populate('originalVet', 'clinicName vetName');

        if (document) {
          document._url = await s3Service.getViewUrl(document.s3Key);
        }

        return document;
      })
    );

    // Filter out null results (documents that weren't found or had invalid updates)
    const successfulUpdates = updatedDocuments.filter(doc => doc !== null);

    if (successfulUpdates.length === 0) {
      return res.status(404).json({ message: 'No valid documents found for update' });
    }

    res.json({
      message: `Successfully updated ${successfulUpdates.length} document(s)`,
      documents: successfulUpdates,
      count: successfulUpdates.length
    });

  } catch (error) {
    console.error('Error updating document(s):', error);
    res.status(500).json({ message: 'Error updating document(s)' });
  }
});

// Archive/restore document for a pet
router.put('/pets/:petId/documents/:documentId/status', isAuthenticated, async (req, res) => {
  try {
    const { petId, documentId } = req.params;
    const { status } = req.body; // Accept the new status in the request body

    if (!['ACTIVE', 'ARCHIVED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const pet = await Pet.findOne({ _id: petId, user: req.user._id });
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    const document = await Document.findOne({
      _id: documentId,
      pet: petId
    });
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    document.status = status;
    await document.save();

    res.json({
      message: `Document ${status === 'ARCHIVED' ? 'archived' : 'restored'} successfully`,
      documentId: document._id
    });
  } catch (error) {
    console.error('Error updating document status:', error);
    res.status(500).json({ message: 'Error updating document status' });
  }
});

// Delete document for a pet
router.delete('/pets/:petId/documents/:documentId', isAuthenticated, async (req, res) => {
  try {
    const { petId, documentId } = req.params;

    // Verify pet belongs to user
    const pet = await Pet.findOne({ _id: petId, user: req.user._id });
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    const document = await Document.findOne({
      _id: documentId,
      pet: petId
    });
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if document is archived
    if (document.status !== 'ARCHIVED') {
      return res.status(400).json({ 
        message: 'Document must be archived before it can be deleted' 
      });
    }

    // Delete from S3 AWS
    await s3Service.deleteFile(document.s3Key);

    // Delete document record
    await Document.findByIdAndDelete(documentId);

    res.json({
      message: 'Document deleted successfully',
      documentId: document._id
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Error deleting document' });
  }
});

module.exports = router;