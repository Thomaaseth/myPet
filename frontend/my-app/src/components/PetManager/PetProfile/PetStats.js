import React from 'react';
import StatsItem from './StatsItem';
import styles from './PetProfile.module.css';

const PetStats = ({ pet }) => {
  const formatAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    // Add months for young pets
    if (age === 0) {
    const months = monthDiff + 12;
    return `${months} months`;
  }
    
  return `${age} ${age === 1 ? 'year' : 'years'}`;
  };

  return (
    <div className={styles.petStats}>
      <StatsItem 
        label="Species" 
        value={pet.species.charAt(0).toUpperCase() + pet.species.slice(1)} 
      />
      <StatsItem 
        label="Age" 
        value={`${formatAge(pet.birthDate)}`} 
      />
      <StatsItem 
        label="Birth Date" 
        value={new Date(pet.birthDate).toLocaleDateString()} 
      />
      <StatsItem 
        label="Weight" 
        value={`${pet.weight} kg`} 
      />
    </div>
  );
};

export default PetStats;