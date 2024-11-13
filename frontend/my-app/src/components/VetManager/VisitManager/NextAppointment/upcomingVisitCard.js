import React from 'react';
import styles from './UpcomingVisit.module.css';

const UpcomingVisitCard = ({ appointment, onCancel, onEdit }) => {
  return (
    <div className={styles.appointmentCard}>
      <div className={styles.cardHeader}>
        <h3>Next Appointment</h3>
        <div>
          <button onClick={() => onEdit(appointment)} className={styles.editButton}>
            Edit
          </button>
          <button onClick={onCancel} className={styles.cancelButton}>
            Delete
          </button>
        </div>
      </div>

      <div className={styles.cardContent}>
        <p className={styles.date}>
          <strong>Date:</strong> {new Date(appointment.dateScheduled).toLocaleDateString()}
        </p>
        {appointment.reason && (
          <p className={styles.reason}><strong>Reason:</strong> {appointment.reason}</p>
        )}
        {appointment.notes && (
          <p className={styles.notes}><strong>Notes:</strong> {appointment.notes}</p>
        )}
      </div>
    </div>
  );
};

export default UpcomingVisitCard;