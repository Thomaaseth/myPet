import React from 'react';
import styles from './PastVisits.module.css';

const PastVisitsList = ({ visits, onEditVisit, onDeleteVisit }) => {
    return (
      <div className={styles.visitLog}>
        {visits.sort((a, b) => new Date(b.dateOfVisit) - new Date(a.dateOfVisit)).map(visit => (
          <div key={visit._id} className={styles.logEntry}>
            <div className={styles.logHeader}>
              <div className={styles.logDate}>
                {new Date(visit.dateOfVisit).toLocaleDateString()}
              </div>
              <div className={styles.logActions}>
                <button onClick={() => onEditVisit(visit)}>Edit</button>
                <button onClick={() => onDeleteVisit(visit._id)}>Delete</button>
              </div>
            </div>
            <div className={styles.logContent}>
              <p className={styles.reason}><strong>Reason:</strong> {visit.reason}</p>
              {visit.notes && <p className={styles.notes}><strong>Notes:</strong> {visit.notes}</p>}
              {visit.documents?.length > 0 && (
                <div className={styles.documents}>
                  <strong>Documents:</strong>
                  <ul>
                    {visit.documents.map(doc => (
                      <li key={doc._id}>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          {doc.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  export default PastVisitsList;
