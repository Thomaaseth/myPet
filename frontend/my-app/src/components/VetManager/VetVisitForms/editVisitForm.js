import React from 'react';
import styles from './VetVisitForms.module.css';

const EditVisitForm = ({
  visitData,
  onInputChange,
  onSubmit,
  onCancel,
  isOpen
}) => {
  if (!isOpen) return null;

  const handleAddPrescription = () => {
    const prescriptionInput = document.getElementById('editPrescription');
    if (prescriptionInput.value.trim()) {
      onInputChange({
        target: {
          name: 'prescriptions',
          value: [...visitData.prescriptions, prescriptionInput.value.trim()]
        }
      });
      prescriptionInput.value = '';
    }
  };

  const handleRemovePrescription = (index) => {
    onInputChange({
      target: {
        name: 'prescriptions',
        value: visitData.prescriptions.filter((_, i) => i !== index)
      }
    });
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Edit Visit</h2>
          <p>Modify the visit details below</p>
        </div>

        <form onSubmit={onSubmit} className={styles.visitForm}>
          <div className={styles.formGroup}>
            <label htmlFor="edit-dateOfVisit">Date of Visit</label>
            <input
              type="date"
              id="edit-dateOfVisit"
              name="dateOfVisit"
              value={visitData.dateOfVisit}
              onChange={onInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="edit-nextAppointment">Next Appointment</label>
            <input
              type="date"
              id="edit-nextAppointment"
              name="nextAppointment"
              value={visitData.nextAppointment}
              onChange={onInputChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="edit-reason">Reason for Visit</label>
            <input
              type="text"
              id="edit-reason"
              name="reason"
              value={visitData.reason}
              onChange={onInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="edit-notes">Notes</label>
            <textarea
              id="edit-notes"
              name="notes"
              value={visitData.notes}
              onChange={onInputChange}
              rows="4"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Prescriptions</label>
            <div className={styles.prescriptionInput}>
              <input
                type="text"
                id="editPrescription"
                placeholder="Enter prescription"
              />
              <button
                type="button"
                onClick={handleAddPrescription}
                className={styles.addButton}
              >
                Add
              </button>
            </div>
            <ul className={styles.prescriptionList}>
              {visitData.prescriptions.map((prescription, index) => (
                <li key={index} className={styles.prescriptionItem}>
                  <span>{prescription}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePrescription(index)}
                    className={styles.removeButton}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </form>

        <div className={styles.modalFooter}>
          <button onClick={onCancel} className={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={onSubmit} className={styles.submitButton}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditVisitForm;