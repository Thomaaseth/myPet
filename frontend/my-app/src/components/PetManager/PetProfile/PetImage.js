import React from 'react';
import styles from './PetProfile.module.css';

const PetImage = ({ imageUrl, name }) => {
  return (
    <div className={styles.petImageContainer}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`${name}'s photo`}
          className={styles.petImage}
        />
      ) : (
        <div className={styles.placeholderImage}>
          <span>{name ? name[0].toUpperCase() : '?'}</span>
        </div>
      )}
    </div>
  );
};

export default PetImage;