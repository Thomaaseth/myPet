"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  getDocuments,
  createDocument,
  deleteDocument,
  searchDocuments,
  batchUpdateDocuments
} from '@/lib/api';
import { SUGGESTED_TAGS } from '../../../src/constants/suggestedTags';
import DocumentGrid from './DocumentDisplay/DocumentGrid';
import DocumentList from './DocumentDisplay/DocumentList';
import UploadPreview from './UploadPreview/UploadPreview';
import SearchBar from './DocumentSearch/SearchBar';
import TagFilter from './DocumentSearch/TagFilter';
import TagInput from './TagInput/TagInput';
import ViewToggle from './DocumentSearch/ViewToggle';
import SortControls from './DocumentSearch/SortControls';
import BatchOperations from './DocumentSearch/BatchOperations';
import BatchTagModal from './BatchTagModal/BatchTagModal';
import StatusToggle from './DocumentSearch/StatusToggle';
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
  const [editingDocument, setEditingDocument] = useState(null);
  const [showBatchTagModal, setShowBatchTagModal] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [documentStatus, setDocumentStatus] = useState('ACTIVE');


  const fetchDocuments = async () => {
    try {
      const response = await getDocuments(petId, { status: documentStatus });
      console.log('Documents response:', response);

      setDocuments(response.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  useEffect(() => {
    if (petId) {
      fetchDocuments();
    }
  }, [petId, documentStatus]);

  useEffect(() => {
    if (petId) {
      handleSearch();
    }
  }, [petId, searchQuery, selectedTags]);

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

const handleSelectionChange = (docIds) => {
  const fullDocs = documents.filter(doc => docIds.includes(doc._id));
  setSelectedDocuments(fullDocs);
  setSelectedDocs(docIds);
};

const handleEditDocument = (doc) => {
  setEditingDocument(doc);
};


const handleDocumentUpdate = async (documentIds, updates, options = {}) => {
  try {
    setIsUploading(options.showLoading ?? true);
    
    // Convert single ID to array if needed
    const ids = Array.isArray(documentIds) ? documentIds : [documentIds];
    
    // Prepare updates array
    const updatesArray = ids.map(docId => ({
      documentId: docId,
      ...updates
    }));

    console.log('Sending to backend:', { updates: updatesArray });  // Add this log

    await batchUpdateDocuments(petId, { updates: updatesArray });
    
    // Clear selection if it's a batch operation
    if (ids.length > 1) {
      setSelectedDocs([]);
      setSelectedDocuments([]);
    }

    await fetchDocuments();

    // Close modal if updating tags
    if (updates.tags) {
      setShowBatchTagModal(false);
    }
  } catch (error) {
    console.error('Error updating documents:', error);
  } finally {
    setIsUploading(false);
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
    setDocuments(response.documents || []);
  } catch (error) {
    console.error('Error searching documents:', error);
  }
};

const sortDocuments = (docs, { field, order }) => {
  return [...docs].sort((a, b) => {
    let comparison;
    switch (field) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
      case 'uploadDate':
      default:
        comparison = new Date(a.uploadDate) - new Date(b.uploadDate);
    }
    return order === 'asc' ? comparison : -comparison;
  });
};

// const handleUpdateDocument = async (documentId, updates) => {
//   await handleDocumentUpdate(documentId, updates, { showLoading: false });
// };

// const handleArchiveDocument = async (documentId) => {
//   await handleDocumentUpdate(
//     documentId, 
//     { status: documentStatus === 'ARCHIVED' ? 'ACTIVE' : 'ARCHIVED' },
//     { showLoading: false }
//   );
// };

const handleBatchTagUpdate = async (updates) => {
  try {
    setIsUploading(true);
        
    // Pass updates directly to batchUpdateDocuments
    await batchUpdateDocuments(petId, { updates });
    
    setSelectedDocs([]);
    setSelectedDocuments([]);
    await fetchDocuments();
    setShowBatchTagModal(false);
  } catch (error) {
    console.error('Error updating document tags:', error);
  } finally {
    setIsUploading(false);
  }
};

const handleBatchArchive = async () => {
  await handleDocumentUpdate(
    selectedDocs, 
    { status: documentStatus === 'ARCHIVED' ? 'ACTIVE' : 'ARCHIVED' },
    { showLoading: false }
  );
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
        onTagUpdate={() => setShowBatchTagModal(true)}
        onArchive={handleBatchArchive}
      />
      )}

      {showBatchTagModal && (
      <BatchTagModal
        isOpen={showBatchTagModal}
        onClose={() => setShowBatchTagModal(false)}
        onUpdateTags={handleBatchTagUpdate}
        selectedCount={selectedDocs.length}
        documents={selectedDocuments}
        suggestions={SUGGESTED_TAGS}
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
          onUpdateName={(fileId, name) => {
            setUploadQueue(prev => prev.map(file => 
              file.id === fileId ? { ...file, name } : file
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
        <div className={styles.leftControls}>
          <StatusToggle 
            value={documentStatus} 
            onChange={(status) => {
              setDocumentStatus(status);
              setSelectedDocs([]); // Clear selection when switching views
            }} 
          />
        </div>
        <div className={styles.rightControls}>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <TagFilter selectedTags={selectedTags} onChange={setSelectedTags} />
          <ViewToggle value={viewMode} onChange={setViewMode} />
          <SortControls value={sortBy} onChange={setSortBy} />
        </div>
      </div>

      {selectedDocs.length > 0 && (
        <BatchOperations
          selectedCount={selectedDocs.length}
          onTagUpdate={() => setShowBatchTagModal(true)}
          onArchive={() => handleDocumentUpdate(
            selectedDocs, 
            { status: documentStatus === 'ARCHIVED' ? 'ACTIVE' : 'ARCHIVED' },
            { showLoading: false }
          )}
          documentStatus={documentStatus}
        />
      )}

      {viewMode === 'grid' ? (
        <DocumentGrid
          petId={petId}
          sortBy={sortBy}
          documents={sortDocuments(documents, sortBy)}
          searchQuery={searchQuery}
          selectedTags={selectedTags}
          selectedDocs={selectedDocs}
          onUpdateDocument={(docId, updates) => handleDocumentUpdate(docId, updates, { showLoading: false })}
          onEditDocument={handleEditDocument}
          onArchiveDocument={(docId) => handleDocumentUpdate(
            docId, 
            { status: documentStatus === 'ARCHIVED' ? 'ACTIVE' : 'ARCHIVED' }, 
            { showLoading: false }
          )}
          onDeleteDocument={handleDeleteDocument}
          onSelectionChange={handleSelectionChange}
        />
      ) : (
        <DocumentList
          petId={petId}
          sortBy={sortBy}
          documents={sortDocuments(documents, sortBy)}          
          searchQuery={searchQuery}
          selectedTags={selectedTags}
          selectedDocs={selectedDocs}
          onSelectionChange={handleSelectionChange}
          onEditDocument={handleEditDocument}
          onUpdateDocument={(docId, updates) => handleDocumentUpdate(docId, updates, { showLoading: false })}
          onArchiveDocument={(docId) => handleDocumentUpdate(
            docId, 
            { status: documentStatus === 'ARCHIVED' ? 'ACTIVE' : 'ARCHIVED' }, 
            { showLoading: false }
          )}
          onDeleteDocument={handleDeleteDocument}
        />
      )}
      
      {editingDocument && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Edit Document</h2>
            <input
              type="text"
              value={editingDocument.name}
              onChange={(e) => setEditingDocument({...editingDocument, name: e.target.value})}
            />
            <TagInput
              value={editingDocument.tags}
              onChange={(tags) => setEditingDocument({...editingDocument, tags})}
              suggestions={SUGGESTED_TAGS}
            />
            <div className={styles.modalActions}>
            <button onClick={() => {
              console.log('Sending update:', {
                documentId: editingDocument._id,
                name: editingDocument.name,
                tags: editingDocument.tags
              });
              handleDocumentUpdate(
                editingDocument._id,
                {
                  name: editingDocument.name,
                  tags: editingDocument.tags
                },
                { showLoading: false }
              );
              setEditingDocument(null);
            }}>Save</button>
              <button onClick={() => setEditingDocument(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManager;
