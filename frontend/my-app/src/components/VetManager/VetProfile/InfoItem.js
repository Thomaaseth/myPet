import React from 'react';
import styles from './VetProfile.module.css';

const InfoItem = ({ label, value }) => {
  return (
    <div className={styles.infoItem}>
      <label>{label}: </label>
      <span>{value}</span>
    </div>
  );
};

export default InfoItem;