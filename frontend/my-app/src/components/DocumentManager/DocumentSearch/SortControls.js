import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import styles from './SortControls.module.css';

const SortControls = ({ value, onChange }) => (
  <div className={styles.sortControls}>
    <ArrowUpDown className={styles.sortIcon} />
    <select
      value={`${value.field}-${value.order}`}
      onChange={(e) => {
        const [field, order] = e.target.value.split('-');
        onChange({ field, order });
      }}
      className={styles.sortSelect}
    >
      <option value="uploadDate-desc">Newest First</option>
      <option value="uploadDate-asc">Oldest First</option>
      <option value="name-asc">Name A-Z</option>
      <option value="name-desc">Name Z-A</option>
      <option value="size-desc">Largest First</option>
      <option value="size-asc">Smallest First</option>
    </select>
  </div>
);

export default SortControls;