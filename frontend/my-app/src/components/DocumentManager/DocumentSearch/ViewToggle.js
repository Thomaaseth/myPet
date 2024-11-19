import React from 'react';
import { Grid, List } from 'lucide-react';
import styles from './ViewToggle.module.css';

const ViewToggle = ({ value, onChange }) => (
<div className={styles.viewToggle}>
    <button
      className={`${styles.toggleBtn} ${value === 'grid' ? styles.active : ''}`}
      onClick={() => onChange('grid')}
    >
      <Grid className={styles.toggleIcon} />
    </button>
    <button
      className={`${styles.toggleBtn} ${value === 'list' ? styles.active : ''}`}
      onClick={() => onChange('list')}
    >
      <List className={styles.toggleIcon} />
    </button>
  </div>
);

export default ViewToggle;