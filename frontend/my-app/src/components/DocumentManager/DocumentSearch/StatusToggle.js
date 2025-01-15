import React from 'react';
import { Archive, Files } from 'lucide-react';
import styles from './StatusToggle.module.css';

const StatusToggle = ({ value = 'ACTIVE', onChange }) => {
  return (
    <div className={styles.toggleContainer}>
      <button
        onClick={() => onChange('ACTIVE')}
        className={`${styles.toggleButton} ${value === 'ACTIVE' ? styles.active : ''}`}
      >
        <Files className={styles.icon} />
        <span>Active</span>
      </button>
      <button
        onClick={() => onChange('ARCHIVED')}
        className={`${styles.toggleButton} ${value === 'ARCHIVED' ? styles.active : ''}`}
      >
        <Archive className={styles.icon} />
        <span>Archived</span>
      </button>
    </div>
  );
};

export default StatusToggle;