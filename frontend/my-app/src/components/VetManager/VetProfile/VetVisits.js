import React from 'react';
import styles from './VetProfile.module.css';

const VetVisits = ({ visits, onEditVisit, onDeleteVisit, onAddVisit }) => {
  return (
    <div className={styles.visitSection}>
      <h4>Visits</h4>
      <div className={styles.visitList}>
        {visits.map(visit => (
          <div key={visit._id} className={styles.visitItem}>
            <p>Date: {new Date(visit.dateOfVisit).toLocaleDateString()}</p>
            {visit.nextAppointment && (
              <p>Next: {new Date(visit.nextAppointment).toLocaleDateString()}</p>
            )}
            <p>Reason: {visit.reason}</p>
            <div className={styles.visitActions}>
              <button onClick={() => onEditVisit(visit)}>Edit</button>
              <button onClick={() => onDeleteVisit(visit._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      <button 
        className={styles.addButton}
        onClick={onAddVisit}
      >
        Add Visit
      </button>
    </div>
  );
};

export default VetVisits;