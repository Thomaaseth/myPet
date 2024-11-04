import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './PetTabs.module.css';

const PetTabs = ({ pets, selectedPetId }) => {
    const router = useRouter();

    return (
        <div className={styles.petTabs}>
            {pets.map(pet => (
                <button
                    key={pet._id}
                    className={`${styles.petTab} ${pet._id === selectedPetId ? styles.active : ''}`}
                    onClick={() => router.push(`/myvets?petId=${pet._id}`)}
                >
                    {pet.name}
                </button>
            ))}
        </div>
    );
};

export default PetTabs;