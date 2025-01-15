import React, { useState, useEffect } from 'react';
import TagInput from '../TagInput/TagInput';
import { X } from 'lucide-react';
import styles from './BatchTagModal.module.css';

const BatchTagModal = ({ 
    isOpen, 
    onClose, 
    onUpdateTags, 
    documents,
    suggestions = [] 
  }) => {
    // Keep track of tags for each document
    const [documentTags, setDocumentTags] = useState(
      documents.reduce((acc, doc) => ({
        ...acc,
        [doc._id]: doc.tags || []
      }), {})
    );
  
    const handleTagChange = (docId, newTags) => {
      setDocumentTags(prev => ({
        ...prev,
        [docId]: newTags
      }));
    };
  
    const handleSubmit = () => {
      // Convert documentTags object to array format expected by the API
      const updates = Object.entries(documentTags).map(([docId, tags]) => ({
        documentId: docId,
        tags
      }));
      onUpdateTags(updates);
    };
  
    if (!isOpen) return null;
  
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>
              Update Tags for {documents.length} Document{documents.length !== 1 ? 's' : ''}
            </h2>
            <button 
              onClick={onClose}
              className={styles.closeButton}
            >
              <X />
            </button>
          </div>
  
          <div className={styles.modalBody}>
            <p className={styles.modalDescription}>
              Edit tags for each document individually
            </p>
            
            <div className={styles.documentsList}>
              {documents.map(doc => (
                <div key={doc._id} className={styles.documentItem}>
                  <div className={styles.documentInfo}>
                    <h3 className={styles.documentName}>{doc.name}</h3>
                    {doc.originalName && doc.originalName !== doc.name && (
                      <span className={styles.originalName}>({doc.originalName})</span>
                    )}
                  </div>
                  <TagInput
                    value={documentTags[doc._id]}
                    onChange={(tags) => handleTagChange(doc._id, tags)}
                    suggestions={suggestions}
                  />
                </div>
              ))}
            </div>
          </div>
  
          <div className={styles.modalActions}>
            <button
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className={styles.updateButton}
            >
              Update All Tags
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default BatchTagModal;