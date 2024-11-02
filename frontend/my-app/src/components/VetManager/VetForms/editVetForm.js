import React from 'react';
import styles from './VetForms.module.css';

const EditVetForm = ({
  formData,
  onChange,
  onSubmit,
  onCancel
}) => {
  return (
    <div className={styles.editFormOverlay}>
      <form onSubmit={onSubmit} className={styles.vetForm}>
        <div className={styles.formGroup}>
          <label htmlFor="edit-clinicName">Clinic Name:</label>
          <input
            id="edit-clinicName"
            type="text"
            name="clinicName"
            value={formData.clinicName}
            onChange={onChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="edit-vetName">Veterinarian Name:</label>
          <input
            id="edit-vetName"
            type="text"
            name="vetName"
            value={formData.vetName}
            onChange={onChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="edit-street">Street:</label>
          <input
            id="edit-street"
            type="text"
            name="address.street"
            value={formData.address.street}
            onChange={onChange}
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="edit-city">City:</label>
            <input
              id="edit-city"
              type="text"
              name="address.city"
              value={formData.address.city}
              onChange={onChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="edit-zipCode">Zip Code:</label>
            <input
              id="edit-zipCode"
              type="text"
              name="address.zipCode"
              value={formData.address.zipCode}
              onChange={onChange}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="edit-email">Email:</label>
          <input
            id="edit-email"
            type="email"
            name="contactInfo.email"
            value={formData.contactInfo.email}
            onChange={onChange}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="edit-phone">Phone:</label>
          <input
            id="edit-phone"
            type="tel"
            name="contactInfo.phone"
            value={formData.contactInfo.phone}
            onChange={onChange}
            required
          />
        </div>

        <div className={styles.formActions}>
          <button type="button" onClick={onCancel} className={styles.cancelButton}>
            Cancel
          </button>
          <button type="submit" className={styles.submitButton}>
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditVetForm;