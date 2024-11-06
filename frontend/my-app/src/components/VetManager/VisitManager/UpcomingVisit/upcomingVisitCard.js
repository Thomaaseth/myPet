import React from 'react';
import styles from './UpcomingVisit.module.css';

const UpcomingVisitCard = ({ visit, onCancel }) => {
  return (
    <div className={styles.appointmentCard}>
      <div className={styles.cardHeader}>
        <h3>Next Appointment</h3>
        <button onClick={onCancel} className={styles.cancelButton}>
          Cancel
        </button>
      </div>
      <div className={styles.cardContent}>
        <p className={styles.date}>
          <strong>Date:</strong> {new Date(visit.dateOfVisit).toLocaleDateString()}
        </p>
        {visit.reason && (
          <p className={styles.reason}><strong>Reason:</strong> {visit.reason}</p>
        )}
        {visit.notes && (
          <p className={styles.notes}><strong>Notes:</strong> {visit.notes}</p>
        )}
      </div>
    </div>
  );
};

export default UpcomingVisitCard;