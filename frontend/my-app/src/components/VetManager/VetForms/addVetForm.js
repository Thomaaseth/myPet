"use client"

import React, { useState } from 'react';
import styles from './VetForms.module.css';

const AddVetForm = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  isOpen = false,
  isEditing = false,
  otherPets = []
}) => {
  const [showSharingModal, setShowSharingModal] = useState(false);
  const [selectedPets, setSelectedPets] = useState({});

  const handleFormSubmit = async (e) => {
    e?.preventDefault();
    
    // If there are other pets and it's not editing mode, show sharing modal
    if (otherPets.length > 0 && !isEditing) {
      setShowSharingModal(true);
    } else {
      onSubmit(e, {});
    }
  };

  if (!isOpen && isEditing) return null;

  return (
    <div className={isEditing ? styles.modalOverlay : styles.addVetFormContainer}>
      <div className={isEditing ? styles.modalContent : ''}>
        <div className={styles.modalHeader}>
          <h2>{isEditing ? 'Edit Veterinarian Contact' : 'Add New Veterinarian'}</h2>
        </div>

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