import React from 'react';
import { FileIcon, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import styles from'./DocumentCard.module.css';

const DocumentCard = ({ document, selected, onSelect }) => {
  return (
<div className={`${styles.documentCard} ${selected ? styles.selected : ''}`}>
    <div className={styles.documentCardHeader}>
      <div className={styles.documentCardIcon}>
        {document.mimeType.startsWith('image/') ? (
          <img src={document._url} alt={document.name} />
        ) : (
          <FileIcon />
        )}
      </div>
      <button 
        className={styles.selectButton}
        onClick={() => onSelect(!selected)}
      >
        <CheckCircle className={selected ? styles.checked : ''} />
      </button>
    </div>
    <div className={styles.documentCardContent}>
      <h3 className={styles.documentName}>{document.name}</h3>
      <p className={styles.uploadDate}>
        {formatDistanceToNow(new Date(document.uploadDate), { addSuffix: true })}
      </p>
      <div className={styles.documentTags}>
        {document.tags.map(tag => (
          <span key={tag} className={styles.tag}>{tag}</span>
        ))}
      </div>
    </div>
  </div>
  );
};

export default DocumentCard;