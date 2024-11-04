"use client"

import React from "react"
import VetProfile from "@/components/VetManager/VetProfile"
import AddVisitForm from "@/components/VetManager/VetVisitForms/addVisitForm"
import EditVisitForm from "@/components/VetManager/VetVisitForms/editVisitForm"
import styles from './VetDetailsLayout.module.css'

const VetDetailsLayout = ({
    vet,
    visits,
    onEdit,
    onDelete,
    onEditVisit,
    onDeleteVisit,
    onAddVisit,
    showDocuments,
    onToggleDocuments,
    onUploadDocument,
    visitFormData,
    onVisitFormChange,
    onVisitSubmit,
    onVisitCancel,
    isVisitFormOpen,
    editingVisit,
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
        <VetProfile
          vet={vet}
          visits={visits}
          onEditVisit={onEditVisit}
          onDeleteVisit={onDeleteVisit}
          onAddVisit={onAddVisit}
          showDocuments={showDocuments}
          onToggleDocuments={onToggleDocuments}
          onUploadDocument={onUploadDocument}
        />

        <AddVisitForm
          visitData={visitFormData}
          onInputChange={onVisitFormChange}
          onSubmit={onVisitSubmit}
          onCancel={onVisitCancel}
          isOpen={isVisitFormOpen && !editingVisit}
        />

        <EditVisitForm
          visitData={visitFormData}
          onInputChange={onVisitFormChange}
          onSubmit={onVisitSubmit}
          onCancel={onVisitCancel}
          isOpen={isVisitFormOpen && editingVisit}
        />
      </div>
    </div>
  );
};

export default VetDetailsLayout;