import React from 'react';
import styles from './VetTabs.module.css';

const VetTabs = ({
  vets,
  activeTab,
  onTabClick,
  onDeleteVet
}) => {
  return (
    <div className={styles.vetTabs}>
      {vets.map(vet => (
        <button
          key={vet._id}
          className={`${styles.vetTab} ${activeTab === vet._id ? styles.active : ''}`}
          onClick={() => onTabClick(vet._id)}
        >
          {vet.clinicName}
          <button 
            className={styles.deleteButton}
            onClick={(e) => {
              e.stopPropagation();
              onDeleteVet(vet._id);
            }}
          >
            ×
          </button>
        </button>
      ))}
      <button
        className={`${styles.vetTab} ${activeTab === 'add' ? styles.active : ''}`}
        onClick={() => onTabClick('add')}
      >
        + Add Vet
      </button>
    </div>
  );
};

export default VetTabs;