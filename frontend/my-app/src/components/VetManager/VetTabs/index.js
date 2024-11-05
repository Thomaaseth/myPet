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
        <div
          key={vet._id}
          className={`${styles.vetTab} ${activeTab === vet._id ? styles.active : ''}`}
        >
          <button 
            className={styles.tabButton}
            onClick={() => onTabClick(vet._id)}
          >
            {vet.clinicName}
          </button>
          <button 
            className={styles.deleteButton}
            onClick={(e) => {
              e.stopPropagation();
              onDeleteVet(vet._id);
            }}
          >
            ×
          </button>
        </div>
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