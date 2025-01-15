import React, { useState, useEffect } from 'react';
import TagInput from '../TagInput/TagInput';
import { X } from 'lucide-react';
import styles from './BatchTagModal.module.css';

const BatchTagModal = ({ 
  isOpen, 
  onClose, 
  onUpdateTags, 
  selectedCount,
  documents, 
  existingTags = [], 
  suggestions = [] 
}) => {
  const [tags, setTags] = useState([]);

  useEffect(() => {
    if (documents && documents.length > 0) {
      const allTags = documents.reduce((acc, doc) => {
        if (doc.tags) {
          return [...acc, ...doc.tags];
        }
        return acc;
      }, []);
      
      // Remove duplicates
      const uniqueTags = [...new Set(allTags)];
      setTags(uniqueTags);
    }
  }, [documents]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            Update Tags for {selectedCount} Document{selectedCount !== 1 ? 's' : ''}
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
          Add or remove tags for the selected documents. 
          Existing tags will be preserved unless removed.
          </p>
          <TagInput
            value={tags}
            onChange={setTags}
            suggestions={suggestions}
          />
        </div>

        <div className={styles.modalActions}>
          <button
            onClick={onClose}
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onUpdateTags(tags);
              onClose();
            }}
            className={styles.updateButton}
          >
            Update Tags
          </button>
        </div>
      </div>
    </div>
  );
};

export default BatchTagModal;