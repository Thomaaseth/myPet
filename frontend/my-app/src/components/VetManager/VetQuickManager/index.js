import React, { useState } from 'react';
import styles from './VetsQuickManager.module.css';

const VetsQuickManager = ({ 
    pets, 
    allVets, 
    onSave, 
    onClose 
}) => {
    // Initialize with current assignments
    const [petVets, setPetVets] = useState(() => {
      return pets.reduce((acc, pet) => ({
        ...acc,
        [pet._id]: pet.vets ? pet.vets.map(vet => 
          typeof vet === 'string' ? vet : vet._id
        ) : []
      }), {});
    });
  
    const handleVetToggle = (petId, vetId) => {
      setPetVets(prev => {
        const currentVets = prev[petId] || [];
        return {
          ...prev,
          [petId]: currentVets.includes(vetId)
            ? currentVets.filter(id => id !== vetId)
            : [...currentVets, vetId]
        };
      });
    };
  
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <h2>Manage Veterinarians</h2>
            <button onClick={onClose} className={styles.closeButton}>×</button>
          </div>
  
          <div className={styles.petsContainer}>
            {pets.map(pet => (
              <div key={pet._id} className={styles.petSection}>
                <h3>{pet.name}</h3>
                <div className={styles.vetsList}>
                  {allVets.map(vet => (
                    <label key={vet._id} className={styles.vetCheckbox}>
                      <input
                        type="checkbox"
                        checked={petVets[pet._id]?.includes(vet._id)}
                        onChange={() => handleVetToggle(pet._id, vet._id)}
                      />
                      <span>{vet.clinicName} - {vet.vetName}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
  
          <div className={styles.modalFooter}>
            <button onClick={() => onSave(petVets)} className={styles.saveButton}>
              Save Changes
            </button>
            <button onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

export default VetsQuickManager;