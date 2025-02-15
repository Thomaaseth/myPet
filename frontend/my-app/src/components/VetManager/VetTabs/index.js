import React from 'react';
import styles from './VetTabs.module.css';

const VetTabs = ({ 
  vets, 
  activeTab, 
  onTabClick, 
  onDeleteVet,
  onManageVets 
}) => {
  return (
    <div className={styles.vetTabs}>
      <div className={styles.tabsContainer}>
        {vets.map(vet => (
          <button
            key={vet._id}
            className={`${styles.vetTab} ${activeTab === vet._id ? styles.active : ''}`}
            onClick={() => onTabClick(vet._id)}
          >
            {vet.clinicName}
          </button>
        ))}
        <button
          className={`${styles.vetTab} ${styles.addVetTab} ${activeTab === 'add' ? styles.active : ''}`}
          onClick={() => onTabClick('add')}
        >
          + Add New Veterinarian
        </button>
        <button
          className={styles.manageButton}
          onClick={onManageVets}
        >
          Manage My Vets
        </button>
      </div>
    </div>
  );
};

export default VetTabs;