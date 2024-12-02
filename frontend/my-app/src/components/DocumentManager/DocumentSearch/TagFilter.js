import React from 'react';
import { Tag } from 'lucide-react';
import { SUGGESTED_TAGS } from '../../../../src/constants/suggestedTags';
import styles from './TagFilter.module.css';

const TagFilter = ({ selectedTags = [], onChange }) => (
  <div className={styles.tagFilter}>
    <Tag className={styles.filterIcon} />
    {SUGGESTED_TAGS.map(tag => (
      <button
        key={tag}
        className={`${styles.tagBtn} ${selectedTags.includes(tag) ? styles.selected : ''}`}
        onClick={() => {
          if (selectedTags.includes(tag)) {
            onChange(selectedTags.filter(t => t !== tag));
          } else {
            onChange([...selectedTags, tag]);
          }
        }}
      >
        {tag}
      </button>
    ))}
  </div>
);

export default TagFilter;