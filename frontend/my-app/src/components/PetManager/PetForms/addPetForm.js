import React from 'react';
import styles from './PetForms.module.css';

const AddPetForm = ({
  petData,
  speciesList,
  onInputChange,
  onFileChange,
  onSubmit,
  onCancel,
  isEditing = false,
  isOpen
}) => {
  if (!isOpen && !isEditing) return null;

  return (
    <div className={isEditing ? styles.modalOverlay : styles.addPetFormContainer}>
      <div className={isEditing ? styles.modalContent : ''}>
        <div className={styles.modalHeader}>
          <h2>{isEditing ? 'Edit Pet Details' : 'Add New Pet'}</h2>
        </div>

        <form onSubmit={onSubmit} className={isEditing ? styles.editPetForm : styles.addPetForm}>
          <div className={styles.formGroup}>
            <label htmlFor={`${isEditing ? 'edit-' : ''}name`}>Pet Name</label>
            <input
              id={`${isEditing ? 'edit-' : ''}name`}
              type="text"
              name="name"
              value={petData.name}
              onChange={onInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor={`${isEditing ? 'edit-' : ''}species`}>Species</label>
            <select
              id={`${isEditing ? 'edit-' : ''}species`}
              name="species"
              value={petData.species}
              onChange={onInputChange}
              required
            >
              <option value="">Select a species</option>
              {Object.entries(speciesList.categories).map(([category, species]) => (
                <optgroup key={category} label={category.replace(/_/g, ' ')}>
                  {Object.entries(species).map(([key, value]) => (
                    <option key={key} value={value}>
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor={`${isEditing ? 'edit-' : ''}birthDate`}>Birth Date</label>
            <input
              id={`${isEditing ? 'edit-' : ''}birthDate`}
              type="date"
              name="birthDate"
              value={petData.birthDate}
              onChange={onInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor={`${isEditing ? 'edit-' : ''}weight`}>Weight (kg)</label>
            <input
              id={`${isEditing ? 'edit-' : ''}weight`}
              type="number"
              name="weight"
              value={petData.weight}
              onChange={onInputChange}
              min="0"
              step="0.1"
              required
            />
          </div>

          <div className={styles.formGroup}>
            {isEditing && petData.currentImage && (
              <p>Current Image: {petData.currentImage}</p>
            )}
            <label htmlFor={`${isEditing ? 'edit-' : ''}image`}>
              {isEditing ? 'New Image' : 'Pet Image'}
            </label>
            <input
              id={`${isEditing ? 'edit-' : ''}image`}
              type="file"
              name="image"
              onChange={onFileChange}
              accept="image/*"
            />
          </div>
        </form>

        <div className={styles.modalFooter}>
          {isEditing && (
            <button 
              type="button" 
              onClick={onCancel}
              className={styles.cancelButton}
            >
              Cancel
            </button>
          )}
          <button onClick={onSubmit} className={styles.submitButton}>
            {isEditing ? 'Save Changes' : 'Add Pet'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPetForm;