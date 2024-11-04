import React from 'react';
import VetInfo from './VetInfo';
import VetVisits from './VetVisits';
import VetDocuments from './VetDocuments';
import styles from './VetProfile.module.css';

const VetProfile = ({ 
  vet, 
  visits,
  onEditVisit,
  onDeleteVisit,
  onAddVisit,
  showDocuments,
  onToggleDocuments,
  onUploadDocument 
}) => {
  return (
    <div className={styles.vetInfo}>
      <VetInfo vet={vet} />
      <VetVisits 
        visits={visits}
        onEditVisit={onEditVisit}
        onDeleteVisit={onDeleteVisit}
        onAddVisit={onAddVisit}
      />
      <VetDocuments
        showDocuments={showDocuments}
        onToggleDocuments={onToggleDocuments}
        onUploadDocument={onUploadDocument}
      />
    </div>
  );
};

export default VetProfile;