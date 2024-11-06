import React from 'react';
import VetInfo from './VetInfo';
import styles from './VetProfile.module.css';

const VetProfile = ({ vet }) => {
  return (
    <div className={styles.vetInfo}>
      <VetInfo vet={vet} />
    </div>
  );
};

export default VetProfile;