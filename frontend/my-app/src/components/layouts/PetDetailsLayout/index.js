"use client"

import React, { Children } from "react"
import styles from './PetDetailsLayout.module.css'

const PetDetailsLayout = ({
    pet,
    onEdit,
    onDelete,
    children
}) => {
  return (
    <div className={styles.petDetails}>
    {/* Header Section */}
    <div className={styles.petHeader}>
      <h2>{pet.name}</h2>
      <div className={styles.petActions}>
        <button onClick={onEdit}>Edit</button>
        <button onClick={onDelete}>Delete</button>
      </div>
    </div>

    <div className={styles.petContent}>
      <div className={styles.petInfo}>
        <div className={styles.petImageContainer}>
          {pet.imageUrl && (
            <img
              src={pet.imageUrl}
              alt={pet.name}
              className={styles.petImage}
            />
          )}
        </div>
        
        {/* Pet detail Section */}
        <div className={styles.petStats}>
          <div className={styles.statItem}>
            <label>Species:</label>
            <span>{pet.species}</span>
          </div>
          <div className={styles.statItem}>
            <label>Age:</label>
            <span>{pet.age} years</span>
          </div>
          <div className={styles.statItem}>
            <label>Birth Date:</label>
            <span>{new Date(pet.birthDate).toLocaleDateString()}</span>
          </div>
          <div className={styles.statItem}>
            <label>Weight:</label>
            <span>{pet.weight} kg</span>
          </div>
        </div>
      </div>

      {/* Weight Tracker Container */}
      <div className={styles.weightTrackerContainer}>
        {children}
      </div>
    </div>
  </div>
)
}
export default PetDetailsLayout;
