"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  getDocuments,
  createDocument,
  updateDocument,
  archiveDocument,
  deleteDocument,
  searchDocuments,
  batchUpdateDocuments,
  batchArchiveDocuments
} from '@/lib/api';
import { SUGGESTED_TAGS } from '../../../src/constants/suggestedTags';
import DocumentGrid from './DocumentDisplay/DocumentGrid';
import DocumentList from './DocumentDisplay/DocumentList';
import UploadPreview from './UploadPreview/UploadPreview';
import SearchBar from './DocumentSearch/SearchBar';
import TagFilter from './DocumentSearch/TagFilter';
import ViewToggle from './DocumentSearch/ViewToggle';
import SortControls from './DocumentSearch/SortControls';
import BatchOperations from './DocumentSearch/BatchOperations';
import styles from './DocumentManager.module.css';

const DocumentManager = ({ petId, vetId }) => {
  const [documents, setDocuments] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [sortBy, setSortBy] = useState({ field: 'uploadDate', order: 'desc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (petId) {
      fetchDocuments();
    }
  }, [petId]);

  const fetchDocuments = async () => {
    try {
      const response = await getDocuments(petId);
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  useEffect(() => {
    if (petId) {
      handleSearch();
    }
  }, [searchQuery, selectedTags]);

// Upload handling
const handleUpload = async () => {
  setIsUploading(true);
  try {
    await Promise.all(
      uploadQueue.map(async (fileItem) => {
        const documentData = {
          file: fileItem.file,
          name: fileItem.file.name,
          tags: fileItem.tags
        };
        await createDocument(petId, documentData);
      })
    );
    
    setUploadQueue([]);
    fetchDocuments(); // Refresh document list
  } catch (error) {
    console.error('Error uploading documents:', error);
  } finally {
    setIsUploading(false);
  }
};

const onDrop = useCallback((acceptedFiles) => {
  const newFiles = acceptedFiles.map(file => ({
      file,
      id: crypto.randomUUID(),
      status: 'queued',
      progress: 0,
      tags: suggestTags(file.name),
    }));
    setUploadQueue(prev => [...prev, ...newFiles]);
  }, []);

const { getRootProps, getInputProps, isDragActive } = useDropzone({
  onDrop,
  accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png'],
      'application/msword': ['.doc', '.docx']
  },
    maxSize: 5 * 1024 * 1024
  });

const suggestTags = (filename) => {
    const lowercaseFilename = filename.toLowerCase();
    return SUGGESTED_TAGS.filter(tag => 
      lowercaseFilename.includes(tag.toLowerCase())
    );
  };

// Document operations
const handleUpdateDocument = async (documentId, updates) => {
  try {
    await updateDocument(petId, documentId, updates);
    fetchDocuments(); // Refresh list
  } catch (error) {
    console.error('Error updating document:', error);
  }
};

const handleArchiveDocument = async (documentId) => {
  try {
    await archiveDocument(petId, documentId);
    fetchDocuments();
  } catch (error) {
    console.error('Error archiving document:', error);
  }
};

const handleDeleteDocument = async (documentId) => {
  if (window.confirm('Are you sure you want to delete this document?')) {
    try {
      await deleteDocument(petId, documentId);
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  }
};

// Search and filter
const handleSearch = async () => {
  try {
    const response = await searchDocuments(petId, {
      query: searchQuery,
      tags: selectedTags,
      status: 'ACTIVE'
    });
    setDocuments(response.data);
  } catch (error) {
    console.error('Error searching documents:', error);
  }
};

// Batch operations
const handleBatchTagUpdate = async (tags) => {
  try {
    await batchUpdateDocuments(petId, selectedDocs, { tags });
    setSelectedDocs([]);
    fetchDocuments();
  } catch (error) {
    console.error('Error updating document tags:', error);
  }
};

const handleBatchArchive = async () => {
  try {
    await batchArchiveDocuments(petId, selectedDocs);
    setSelectedDocs([]);
    fetchDocuments();
  } catch (error) {
    console.error('Error archiving documents:', error);
  }
};



  return (
    <div className={styles.documentManager}>
      <div 
        {...getRootProps()} 
        className={`${styles.dropzone} ${isDragActive ? styles.active : ''}`}
      >
        <input {...getInputProps()} />
        <p>Drag & drop files here, or click to select files</p>
      </div>

      {selectedDocs.length > 0 && (
      <BatchOperations
        selectedCount={selectedDocs.length}
        onTagUpdate={handleBatchTagUpdate}
        onArchive={handleBatchArchive}
      />
      )}

      {uploadQueue.length > 0 && (
        <UploadPreview
          files={uploadQueue}
          onUpdateTags={(fileId, tags) => {
            setUploadQueue(prev => prev.map(file => 
              file.id === fileId ? { ...file, tags } : file
            ));
          }}
          onRemove={(fileId) => {
            setUploadQueue(prev => 
              prev.filter(file => file.id !== fileId)
            );
          }}
          onUpload={handleUpload}
          isUploading={isUploading}
        />
      )}

      <div className={styles.controls}>
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <TagFilter selectedTags={selectedTags} onChange={setSelectedTags} />
        <ViewToggle value={viewMode} onChange={setViewMode} />
        <SortControls value={sortBy} onChange={setSortBy} />
      </div>

      {selectedDocs.length > 0 && (
        <BatchOperations
          selectedCount={selectedDocs.length}
          onTagUpdate={(tags) => {/* Handle batch tag update */}}
          onArchive={() => {/* Handle batch archive */}}
        />
      )}

      {viewMode === 'grid' ? (
        <DocumentGrid
          petId={petId}
          sortBy={sortBy}
          documents={documents}
          searchQuery={searchQuery}
          selectedTags={selectedTags}
          selectedDocs={selectedDocs}
          onUpdateDocument={handleUpdateDocument}
          onArchiveDocument={handleArchiveDocument}
          onDeleteDocument={handleDeleteDocument}
          onSelectionChange={setSelectedDocs}
        />
      ) : (
        <DocumentList
          petId={petId}
          sortBy={sortBy}
          searchQuery={searchQuery}
          selectedTags={selectedTags}
          selectedDocs={selectedDocs}
          onSelectionChange={setSelectedDocs}
        />
      )}
    </div>
  );
};

export default DocumentManager;
