import React from 'react';
import { Tag } from 'lucide-react';
import { SUGGESTED_TAGS } from '../../../../src/constants/suggestedTags';
import styles from './TagFilter.module.css';

const TagFilter = ({ selectedTags, onChange }) => (
    <div className={styles.tagFilter}>
        <Tag className={styles.filterIcon} />
            <select 
            multiple 
            value={selectedTags}
            onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value);
                onChange(values);
            }}
            className={styles.tagSelect}
            >
      {SUGGESTED_TAGS.map(tag => (
        <option key={tag} value={tag}>
          {tag}
        </option>
      ))}
    </select>
  </div>
);

export default TagFilter;