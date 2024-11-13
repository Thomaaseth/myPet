"use client"

import React, { useState, useEffect } from 'react';
import styles from './VetForms.module.css';

const AddVetForm = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  isOpen = false,
  isEditing = false,
  otherPets = [],
  existingVets = []
}) => {
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [matchedVet, setMatchedVet] = useState(null);
  const [showSharingModal, setShowSharingModal] = useState(false);
  const [selectedPets, setSelectedPets] = useState({});

  // Check for matches as user types
  useEffect(() => {
    if (!isEditing && (formData.clinicName.length > 3 || formData.vetName.length > 3 || formData.contactInfo.phone.length > 3)) {
      const match = existingVets.find(vet => 
        vet.clinicName.toLowerCase().includes(formData.clinicName.toLowerCase()) ||
        vet.vetName.toLowerCase().includes(formData.vetName.toLowerCase()) ||
        vet.contactInfo.phone === formData.contactInfo.phone
      );
      
      if (match && !showSuggestion) {
        setMatchedVet({
          ...match,
          petName: match.pets?.[0]?.name || 'another pet' // Fallback if pet name isn't available
        });
        setShowSuggestion(true);
      }
    }
  }, [formData.clinicName, formData.vetName, formData.contactInfo.phone, isEditing, existingVets]);

  const handleFormSubmit = async (e) => {
    e?.preventDefault();
    
    // If there are other pets and it's not editing mode, show sharing modal
    if (otherPets.length > 0 && !isEditing) {
      setShowSharingModal(true);
    } else {
      onSubmit(e, {});
    }
  };

  const handleUseExistingVet = () => {
    // Update all relevant fields from matched vet
    onChange({
      target: {
        name: 'clinicName',
        value: matchedVet.clinicName
      }
    });
    onChange({
      target: {
        name: 'vetName',
        value: matchedVet.vetName
      }
    });
    onChange({
      target: {
        name: 'contactInfo.phone',
        value: matchedVet.contactInfo.phone
      }
    });
    onChange({
      target: {
        name: 'contactInfo.email',
        value: matchedVet.contactInfo.email
      }
    });
    onChange({
      target: {
        name: 'address.street',
        value: matchedVet.address.street
      }
    });
    onChange({
      target: {
        name: 'address.city',
        value: matchedVet.address.city
      }
    });
    onChange({
      target: {
        name: 'address.zipCode',
        value: matchedVet.address.zipCode
      }
    });
    setShowSuggestion(false);
  };

  if (!isOpen && isEditing) return null;

  return (
    <div className={isEditing ? styles.modalOverlay : styles.addVetFormContainer}>
      <div className={isEditing ? styles.modalContent : ''}>
        <div className={styles.modalHeader}>
          <h2>{isEditing ? 'Edit Veterinarian Contact' : 'Add New Veterinarian'}</h2>
        </div>

        {/* Suggestion Alert */}
        {showSuggestion && matchedVet && (
          <div className={styles.suggestionAlert}>
            <div className={styles.suggestionContent}>
              <p>We found a similar vet from {matchedVet.petName}:</p>
              <div className={styles.matchedVetInfo}>
                <p><strong>Clinic:</strong> {matchedVet.clinicName}</p>
                <p><strong>Vet:</strong> {matchedVet.vetName}</p>
                <p><strong>Phone:</strong> {matchedVet.contactInfo.phone}</p>
              </div>
              <div className={styles.suggestionActions}>
                <button 
                  type="button"
                  onClick={handleUseExistingVet}
                  className={styles.useExistingButton}
                >
                  Use this vet's information
                </button>
                <button 
                  type="button"
                  onClick={() => setShowSuggestion(false)}
                  className={styles.newVetButton}
                >
                  Continue with new vet
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className={styles.vetForm}>
          <div className={styles.formGroup}>
            <label htmlFor="clinicName">Clinic Name</label>
            <input
              id="clinicName"
              type="text"
              name="clinicName"
              value={formData.clinicName}
              onChange={onChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="vetName">Veterinarian Name</label>
            <input
              id="vetName"
              type="text"
              name="vetName"
              value={formData.vetName}
              onChange={onChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="street">Street</label>
            <input
              id="street"
              type="text"
              name="address.street"
              value={formData.address.street}
              onChange={onChange}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="city">City</label>
              <input
                id="city"
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={onChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="zipCode">Zip Code</label>
              <input
                id="zipCode"
                type="text"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={onChange}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="contactInfo.email"
              value={formData.contactInfo.email}
              onChange={onChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              type="tel"
              name="contactInfo.phone"
              value={formData.contactInfo.phone}
              onChange={onChange}
              required
            />
          </div>

          <div className={styles.modalFooter}>
            <button type="button" onClick={onCancel} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              {isEditing ? 'Save Changes' : 'Add Veterinarian'}
            </button>
          </div>
        </form>

        {/* Sharing Modal */}
        {showSharingModal && (
          <div className={styles.sharingModalOverlay}>
            <div className={styles.sharingModalContent}>
              <h3>Share Vet with Other Pets</h3>
              <p>Would you like to add this vet to other pets?</p>
              
              <div className={styles.petsList}>
                {otherPets.map(pet => (
                  <label key={pet._id} className={styles.petCheckboxLabel}>
                    <input
                      type="checkbox"
                      checked={selectedPets[pet._id] || false}
                      onChange={(e) => setSelectedPets(prev => ({
                        ...prev,
                        [pet._id]: e.target.checked
                      }))}
                      className={styles.petCheckbox}
                    />
                    <span>{pet.name}</span>
                  </label>
                ))}
              </div>

              <div className={styles.sharingModalFooter}>
                <button 
                  type="button"
                  onClick={() => {
                    setShowSharingModal(false);
                    onSubmit(null, selectedPets);
                  }}
                  className={styles.submitButton}
                >
                  Add to Selected Pets
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setShowSharingModal(false);
                    onSubmit(null, {});
                  }}
                  className={styles.cancelButton}
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddVetForm;