import React from 'react';
import DocumentCard from './DocumentCard';
import styles from './DocumentGrid.module.css';

const DocumentGrid = ({ 
  documents = [], 
  selectedDocs, 
  onSelectionChange,
  onArchiveDocument,
  onEditDocument,
  onUpdateDocument,
  onDeleteDocument,
  documentStatus  
}) => {
  return (
    <div className={styles.documentGrid}>
      {documents?.map(doc => (
        <DocumentCard 
          key={doc._id}
          document={doc}
          selected={selectedDocs.includes(doc._id)}
          onSelect={(selected) => {
            if (selected) {
              onSelectionChange([...selectedDocs, doc._id]);
            } else {
              onSelectionChange(selectedDocs.filter(id => id !== doc._id));
            }
          }}
          documentStatus={documentStatus}
          onArchive={onArchiveDocument}
        />
      ))}
    </div>
  );
};
export default DocumentGrid;