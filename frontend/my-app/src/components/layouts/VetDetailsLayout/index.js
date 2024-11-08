"use client"

import React from "react"
import VetProfile from "@/components/VetManager/VetProfile"
import VisitManager from "@/components/VetManager/VisitManager/"
import styles from './VetDetailsLayout.module.css'

const VetDetailsLayout = ({
    vet,
    pastVisits,
    nextAppointment,
    onEdit,
    onDelete,
    onAddPastVisit,
    onEditPastVisit,
    onDeletePastVisit,
    onAddNextAppointment,
    onEditNextAppointment,
    onDeleteNextAppointment,
    onUploadDocument,
}) => {
  return (
    <div className={styles.vetDetails}>
      <div className={styles.vetHeader}>
        <h2>{vet.clinicName}</h2>
        <div className={styles.vetActions}>
          <button onClick={onEdit}>Edit</button>
          <button onClick={onDelete}>Delete</button>
        </div>
      </div>

      <div className={styles.vetContent}>
        <VetProfile vet={vet} />
        <VisitManager
          pastVisits={pastVisits}
          nextAppointment={nextAppointment}
          onAddPastVisit={onAddPastVisit}
          onEditPastVisit={onEditPastVisit}
          onDeletePastVisit={onDeletePastVisit}
          onAddNextAppointment={onAddNextAppointment}
          onEditNextAppointment={onEditNextAppointment}
          onDeleteNextAppointment={onDeleteNextAppointment}
          onUploadDocument={onUploadDocument}
        />
      </div>
    </div>
  );
};

export default VetDetailsLayout;