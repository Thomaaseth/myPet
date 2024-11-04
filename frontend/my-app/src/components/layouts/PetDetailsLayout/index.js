"use client"

import React from "react"
import PetProfile from "@/components/PetProfile"
import WeightTracker from "@/components/WeightTracker"
import VetWidget from "@/components/VetWidget"
import styles from './PetDetailsLayout.module.css'

const PetDetailsLayout = ({
    pet,
    onEdit,
    onDelete,
}) => {
  return (
    <div className={styles.petDetails}>
      <div className={styles.petHeader}>
        <h2>{pet.name}</h2>
        <div className={styles.petActions}>
          <button onClick={onEdit}>Edit</button>
          <button onClick={onDelete}>Delete</button>
        </div>
      </div>

      <div className={styles.petContent}>
        <PetProfile pet={pet} />
        <VetWidget pet={pet} />
        <div className={styles.weightTrackerContainer}>
        <WeightTracker 
                        petId={pet._id}
                        initialWeight={pet.weight}
                    />
        </div>
      </div>
    </div>
  );
};
export default PetDetailsLayout;
