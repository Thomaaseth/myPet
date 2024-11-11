import React from 'react';
import styles from './VetForms.module.css';

const AddVetForm = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  isOpen = false,
  isEditing = false
}) => {
  if (!isOpen && isEditing) return null;

  return (
    <div className={isEditing ? styles.modalOverlay : styles.addVetFormContainer}>
      <div className={isEditing ? styles.modalContent : ''}>
      <div className={styles.modalHeader}>
          <h2>{isEditing ? 'Edit Veterinarian Contact' : 'Add New Veterinarian'}</h2>
        </div>

        <form onSubmit={onSubmit} className={styles.vetForm}>
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
        </form>

        <div className={styles.modalFooter}>
          <button onClick={onCancel} className={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={onSubmit} className={styles.submitButton}>
            {isEditing ? 'Save Changes' : 'Add Veterinarian'}
          </button>
        </div>
      </div>
    </div>
  );
};


export default AddVetForm;