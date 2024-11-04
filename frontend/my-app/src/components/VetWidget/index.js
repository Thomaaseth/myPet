import React from 'react';
import Link from 'next/link';
import styles from './VetWidget.module.css';

const VetWidget = ({ pet }) => {
    const primaryVet = pet.vets && pet.vets[0];
    const nextAppointment = pet.vets?.reduce((latest, vet) => {
        const vetNextVisit = vet.visits?.find(visit => new Date(visit.nextAppointment) > new Date());
        if (!latest || (vetNextVisit && new Date(vetNextVisit.nextAppointment) < new Date(latest.nextAppointment))) {
            return vetNextVisit;
        }
        return latest;
    }, null);

    return (
        <div className={styles.vetWidget}>
            <div className={styles.header}>
                <h3>Veterinary Care</h3>
                {primaryVet && (
                    <Link 
                        href={`/myVets?petId=${pet._id}`}
                        className={styles.manageLink}
                    >
                        Manage
                    </Link>
                )}
            </div>

            {primaryVet ? (
                <div className={styles.content}>
                    <div className={styles.primaryVet}>
                        <label>Primary Vet:</label>
                        <span>{primaryVet.clinicName}</span>
                    </div>
                    {nextAppointment && (
                        <div className={styles.nextVisit}>
                            <label>Next Visit:</label>
                            <span>{new Date(nextAppointment.nextAppointment).toLocaleDateString()}</span>
                            <p className={styles.visitReason}>{nextAppointment.reason}</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className={styles.noVet}>
                    <p>No veterinarian assigned</p>
                    <Link 
                        href={`/myVets?petId=${pet._id}&action=add`}
                        className={styles.addVetButton}
                    >
                        Add Veterinarian
                    </Link>
                </div>
            )}
        </div>
    );
};

export default VetWidget;