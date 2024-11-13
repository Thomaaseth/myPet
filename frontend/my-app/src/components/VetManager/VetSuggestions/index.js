
import React from 'react';
import styles from './VetSuggestions.module.css';

const VetSuggestions = ({ 
  existingVets, 
  currentPet, 
  onAddExistingVet, 
  onSkip 
}) => {
  if (!existingVets || existingVets.length === 0) return null;

  return (
    <div className={styles.vetSuggestionsContainer}>
      <h3 className={styles.suggestionsTitle}>Existing Veterinarians</h3>
      {existingVets.map((vet) => (
        <div key={vet._id} className={styles.suggestedVetCard}>
          <div className={styles.suggestedVetInfo}>
            <h4>{vet.clinicName}</h4>
            <p>Dr. {vet.vetName}</p>
            <p className={styles.associatedPet}>
              Currently associated with: {vet.pets.map(pet => pet.name).join(', ')}
            </p>
          </div>
          <div className={styles.suggestedVetActions}>
            <button
              onClick={() => onAddExistingVet(vet)}
              className={styles.addExistingButton}
            >
              Add to {currentPet.name}
            </button>
            <button
              onClick={onSkip}
              className={styles.skipButton}
            >
              Skip
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VetSuggestions;