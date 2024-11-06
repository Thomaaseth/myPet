import React from 'react';
import styles from './VetVisitForms.module.css';

const PastVisitForm = ({
  visitData,
  onInputChange,
  onSubmit,
  onCancel,
  isOpen,
  onDocumentUpload
}) => {
  if (!isOpen) return null;


  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onInputChange({
        target: {
          name: 'documents',
          value: [...(visitData.documents || []), ...files]
        }
      });
    }
  };

  const handleRemoveDocument = (index) => {
    onInputChange({
      target: {
        name: 'documents',
        value: visitData.documents.filter((_, i) => i !== index)
      }
    });
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Add New Visit</h2>
          <p>Enter the visit details below</p>
        </div>

        <form onSubmit={onSubmit} className={styles.visitForm}>
          <div className={styles.formGroup}>
            <label htmlFor="dateOfVisit">Date of Visit</label>
            <input
              type="date"
              id="dateOfVisit"
              name="dateOfVisit"
              value={visitData.dateOfVisit}
              onChange={onInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="reason">Reason for Visit</label>
            <input
              type="text"
              id="reason"
              name="reason"
              value={visitData.reason}
              onChange={onInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={visitData.notes}
              onChange={onInputChange}
              rows="4"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Documents</label>
            <input
              type="file"
              multiple
              onChange={handleDocumentUpload}
              className={styles.fileInput}
            />
            {visitData.documents && visitData.documents.length > 0 && (
              <ul className={styles.documentList}>
                {visitData.documents.map((doc, index) => (
                  <li key={index} className={styles.documentItem}>
                    <span>{doc.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDocument(index)}
                      className={styles.removeButton}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </form>        

        <div className={styles.modalFooter}>
          <button onClick={onCancel} className={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={onSubmit} className={styles.submitButton}>
            Add Visit
          </button>
        </div>
      </div>
    </div>
  );
};

export default PastVisitForm;