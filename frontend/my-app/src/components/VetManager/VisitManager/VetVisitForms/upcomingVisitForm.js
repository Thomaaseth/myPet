import React from 'react';
import styles from './VetVisitForms.module.css';

const UpcomingVisitForm = ({
  appointmentData,
  onInputChange,
  onSubmit,
  onCancel,
  isOpen,
  isEditing = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
        <h2>{isEditing ? 'Edit next appointment' : 'Schedule new appointment'}</h2>
        </div>

        <form onSubmit={onSubmit} className={styles.visitForm}>
          <div className={styles.formGroup}>
            <label htmlFor="dateScheduled">Next Appointment Date</label>
            <input
              type="date"
              id="dateScheduled"
              name="dateScheduled"
              value={appointmentData.dateScheduled}
              onChange={onInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="reason">Reason (Optional)</label>
            <input
              type="text"
              id="reason"
              name="reason"
              value={appointmentData.reason}
              onChange={onInputChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="notes">Notes (Optional)</label>
            <textarea
              id="notes"
              name="notes"
              value={appointmentData.notes}
              onChange={onInputChange}
              rows="4"
            />
          </div>
        </form>

        <div className={styles.modalFooter}>
          <button onClick={onCancel} className={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={onSubmit} className={styles.submitButton}>
          {isEditing ? 'Save Changes' : 'Add appointment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpcomingVisitForm;