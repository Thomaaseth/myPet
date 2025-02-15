import React from 'react';
import { Tag, Archive, Undo } from 'lucide-react';
import styles from './BatchOperations.module.css';

const BatchOperations = ({ 
  selectedCount, 
  onTagUpdate, 
  onArchive,
  documentStatus
}) => (
<div className={styles.batchOperations}>
    <span className={styles.selectedCount}>
      {selectedCount} document{selectedCount !== 1 ? 's' : ''} selected
    </span>
    <div className={styles.batchActions}>
      <button className={styles.batchBtn} onClick={onTagUpdate}>
        <Tag className={styles.batchIcon} />
        Update Tags
      </button>
      <button className={styles.batchBtn} onClick={onArchive}>
        {documentStatus === 'ARCHIVED' ? (
          <>
            <Undo className={styles.batchIcon} />
            Restore
          </>
        ) : (
          <>
            <Archive className={styles.batchIcon} />
            Archive
          </>
        )}
      </button>
    </div>
  </div>
);

export default BatchOperations;