"use client"

import React from "react"
import VetProfile from "@/components/VetManager/VetProfile"
import VisitManager from "@/components/VetManager/VisitManager/"
import styles from './VetDetailsLayout.module.css'

const VetDetailsLayout = ({
    vet,
    visits,
    onEdit,
    onDelete,
    onEditVisit,
    onDeleteVisit,
    onAddVisit,
    onUploadDocument,
    onAddUpcomingVisit,
    onEditUpcomingVisit,
    onDeleteUpcomingVisit,
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
          visits={visits}
          onAddVisit={onAddVisit}
          onEditVisit={onEditVisit}
          onDeleteVisit={onDeleteVisit}
          onUploadDocument={onUploadDocument}
          onAddUpcomingVisit={onAddUpcomingVisit}
          onEditUpcomingVisit={onEditUpcomingVisit}
          onDeleteUpcomingVisit={onDeleteUpcomingVisit}
        />
      </div>
    </div>
  );
};

export default VetDetailsLayout;