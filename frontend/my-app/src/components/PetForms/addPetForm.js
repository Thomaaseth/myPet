import React from 'react';
import styles from './PetForms.module.css';

const AddPetForm = ({
  newPet,
  speciesList,
  onInputChange,
  onFileChange,
  onSubmit
}) => {
  return (
    <div className={styles.addPetFormContainer}>
      <form onSubmit={onSubmit} className={styles.addPetForm}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Pet Name:</label>
          <input
            id="name"
            type="text"
            name="name"
            value={newPet.name}
            onChange={onInputChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="species">Species:</label>
          <select
            id="species"
            name="species"
            value={newPet.species}
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
          <label htmlFor="birthDate">Birth Date:</label>
          <input
            id="birthDate"
            type="date"
            name="birthDate"
            value={newPet.birthDate}
            onChange={onInputChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="weight">Weight (kg):</label>
          <input
            id="weight"
            type="number"
            name="weight"
            value={newPet.weight}
            onChange={onInputChange}
            min="0"
            step="0.1"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="image">Pet Image:</label>
          <input
            id="image"
            type="file"
            name="image"
            onChange={onFileChange}
            accept="image/*"
          />
        </div>

        <button type="submit" className={styles.submitButton}>Add Pet</button>
      </form>
    </div>
  );
};

export default AddPetForm;