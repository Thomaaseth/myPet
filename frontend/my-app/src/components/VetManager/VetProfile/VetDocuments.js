import React from 'react';
import styles from './VetProfile.module.css';

const VetDocuments = ({ showDocuments, onToggleDocuments, onUploadDocument }) => {
  return (
    <>
      <div className={styles.documentSection}>
        <button 
          className={styles.documentsButton}
          onClick={onToggleDocuments}
        >
          Documents
        </button>
        <input
          type="file"
          onChange={(e) => onUploadDocument(e.target.files)}
          style={{ display: 'none' }}
          id="document-upload"
          multiple
        />
        <label 
          htmlFor="document-upload" 
          className={styles.uploadButton}
        >
          Upload
        </label>
      </div>

      {showDocuments && (
        <div className={styles.documentsContainer}>
          {/* Documents list */}
        </div>
      )}
    </>
  );
};

export default VetDocuments;