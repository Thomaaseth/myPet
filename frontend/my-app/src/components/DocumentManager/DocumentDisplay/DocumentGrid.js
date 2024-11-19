import React from 'react';
import DocumentCard from './DocumentCard';
import styles from './DocumentGrid.module.css';

const DocumentGrid = ({ 
  documents = [], 
  selectedDocs, 
  onSelectionChange 
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
      />
    ))}
  </div>
  );
};

export default DocumentGrid;