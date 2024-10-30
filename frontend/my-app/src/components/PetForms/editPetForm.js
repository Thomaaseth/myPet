import React from 'react';
import styles from './PetForms.module.css';

const EditPetForm = ({
  editingPet,
  speciesList,
  onInputChange,
  onFileChange,
  onSubmit,
  onCancel
}) => {
  return (
    <div className={styles.editFormOverlay}>
      <form onSubmit={onSubmit} className={styles.editPetForm}>
        <div className={styles.formGroup}>
          <label htmlFor="edit-name">Pet Name:</label>
          <input
            id="edit-name"
            type="text"
            name="name"
            value={editingPet.name}
            onChange={onInputChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="edit-species">Species:</label>
          <select
            id="edit-species"
            name="species"
            value={editingPet.species}
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
          <label htmlFor="edit-birthDate">Birth Date:</label>
          <input
            id="edit-birthDate"
            type="date"
            name="birthDate"
            value={editingPet.birthDate}
            onChange={onInputChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="edit-weight">Weight (kg):</label>
          <input
            id="edit-weight"
            type="number"
            name="weight"
            value={editingPet.weight}
            onChange={onInputChange}
            min="0"
            step="0.1"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <p>Current Image: {editingPet.currentImage || 'No image uploaded'}</p>
          <label htmlFor="edit-image">New Image:</label>
          <input
            id="edit-image"
            type="file"
            name="image"
            onChange={onFileChange}
            accept="image/*"
          />
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.submitButton}>Save Changes</button>
          <button 
            type="button" 
            onClick={onCancel}
            className={styles.cancelButton}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPetForm;