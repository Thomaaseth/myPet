import React from 'react';
import styles from './PetTabs.module.css';

const PetTabs = ({ 
  pets, 
  selectedPetId, 
  onSelectPet, 
  onAddPet 
}) => {
  return (
    <div className={styles.petTabs}>
      {pets.map((pet) => (
        <button
          key={pet._id}
          className={`${styles.petTab} ${selectedPetId === pet._id ? styles.active : ''}`}
          onClick={() => onSelectPet(pet._id)}
        >
          {pet.name}
        </button>
      ))}
      <button 
        className={`${styles.petTab} ${styles.addPetTab}`}
        onClick={onAddPet}
      >
        + Add New Pet
      </button>
    </div>
  );
};

export default PetTabs;