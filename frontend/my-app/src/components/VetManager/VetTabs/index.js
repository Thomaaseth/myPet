import React from 'react';
import styles from './VetTabs.module.css';

const VetTabs = ({
  vets,
  activeTab,
  onTabClick,
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
        </div>
      ))}
      <button
        className={`${styles.addVetTab} ${activeTab === 'add' ? styles.active : ''}`}
        onClick={() => onTabClick('add')}
      >
        + Add Vet
      </button>
    </div>
  );
};

export default VetTabs;