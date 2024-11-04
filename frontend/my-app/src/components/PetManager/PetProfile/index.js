import React from 'react';
import PetImage from './PetImage';
import PetStats from './PetStats';
import styles from './PetProfile.module.css';

const PetProfile = ({ pet }) => {
  return (
    <div className={styles.petInfo}>
      <PetImage 
        imageUrl={pet.imageUrl} 
        name={pet.name} 
      />
      <PetStats pet={pet} />
    </div>
  );
};

export default PetProfile;