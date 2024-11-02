import React from 'react';
import styles from './VetForms.module.css';

const AddVetForm = ({
  formData,
  onChange,
  onSubmit
}) => {
  return (
    <form onSubmit={onSubmit} className={styles.vetForm}>
      <div className={styles.formGroup}>
        <label htmlFor="clinicName">Clinic Name:</label>
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
        <label htmlFor="vetName">Veterinarian Name:</label>
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
        <label htmlFor="street">Street:</label>
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
          <label htmlFor="city">City:</label>
          <input
            id="city"
            type="text"
            name="address.city"
            value={formData.address.city}
            onChange={onChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="zipCode">Zip Code:</label>
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
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          name="contactInfo.email"
          value={formData.contactInfo.email}
          onChange={onChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="phone">Phone:</label>
        <input
          id="phone"
          type="tel"
          name="contactInfo.phone"
          value={formData.contactInfo.phone}
          onChange={onChange}
          required
        />
      </div>

      <div className={styles.formActions}>
        <button type="submit" className={styles.submitButton}>
          Add Veterinarian
        </button>
      </div>
    </form>
  );
};

export default AddVetForm;