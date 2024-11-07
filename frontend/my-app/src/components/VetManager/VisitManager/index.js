"use client"

import React, { useState } from 'react';
import PastVisitsList from './PastVisits/pastVisitsList';
import NextVisitCard from './UpcomingVisit/upcomingVisitCard';
import PastVisitForm from './VetVisitForms/pastVisitForm';
import EditPastVisitForm from './VetVisitForms/editPastVisitForm';
import UpcomingVisitForm from './VetVisitForms/upcomingVisitForm';
import UpcomingVisitCard from './UpcomingVisit/upcomingVisitCard';
import styles from './VisitManager.module.css';

const VisitManager = ({
  visits,
  onAddVisit,
  onEditVisit,
  onDeleteVisit,
  onAddUpcomingVisit,
  onUploadDocument
}) => {
  const [activeTab, setActiveTab] = useState('past');
  const [isAddingPastVisit, setIsAddingPastVisit] = useState(false);
  const [isAddingUpcomingVisit, setIsAddingUpcomingVisit] = useState(false);
  const [editingUpcomingVisit, setEditingUpcomingVisit] = useState(null);
  const [editingVisit, setEditingVisit] = useState(null);
  const [visitFormData, setVisitFormData] = useState({
    dateOfVisit: '',
    reason: '',
    notes: '',
    documents: []
  });

  const [upcomingFormData, setUpcomingFormData] = useState({
    dateOfVisit: '',
    reason: '',
    notes: ''
  });  

  const pastVisits = visits.filter(visit => !visit.isUpcoming);
  const upcomingVisit = visits.find(visit => visit.isUpcoming);

    // Handler for past visit form changes
    const handlePastVisitChange = (e) => {
      const { name, value } = e.target;
      setVisitFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };
  
    // Handler for upcoming visit form changes
    const handleUpcomingVisitChange = (e) => {
      const { name, value } = e.target;
      setUpcomingFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };
  
    // Reset form data
    const resetPastVisitForm = () => {
      setVisitFormData({
        dateOfVisit: '',
        reason: '',
        notes: '',
        prescriptions: [],
        documents: []
      });
    };
  
    const resetUpcomingVisitForm = () => {
      setUpcomingFormData({
        dateOfVisit: '',
        reason: '',
        notes: ''
      });
    };
  
    // Handle edit visit
    const handleEditVisit = (visit) => {
      const formattedDate = new Date(visit.dateOfVisit).toISOString().split('T')[0];
      setEditingVisit(visit);
      setVisitFormData({
        dateOfVisit: formattedDate,
        reason: visit.reason,
        notes: visit.notes,
        prescriptions: visit.prescriptions || [],
        documents: visit.documents || []
      });
    };

    const handleEditUpcomingVisit = (visit) => {
      const formattedDate = new Date(visit.dateOfVisit).toISOString().split('T')[0];
      setEditingUpcomingVisit(visit);
      setUpcomingFormData({
        dateOfVisit: formattedDate,
        reason: visit.reason,
        notes: visit.notes
      });
      setIsAddingUpcomingVisit(true);
    };

    return (
      <div className={styles.visitManager}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'past' ? styles.active : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Previous Visits
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'upcoming' ? styles.active : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Next Appointment
          </button>
        </div>
  
        <div className={styles.content}>
          {activeTab === 'past' ? (
            <>
              <div className={styles.pastVisitsHeader}>
                <h3>Previous Visits</h3>
                <button 
                  onClick={() => {
                    resetPastVisitForm();
                    setIsAddingPastVisit(true);
                  }}
                  className={styles.addButton}
                >
                  Add Visit
                </button>
              </div>
              <PastVisitsList
                visits={pastVisits}
                onEditVisit={handleEditVisit}
                onDeleteVisit={onDeleteVisit}
              />
            </>
          ) : (
            <div className={styles.upcomingVisitSection}>
              {upcomingVisit ? (
                <UpcomingVisitCard
                  visit={upcomingVisit}
                  onCancel={() => onDeleteVisit(upcomingVisit._id)}
                  onEdit={handleEditUpcomingVisit}
                />
              ) : (
                <button 
                  onClick={() => {
                    resetUpcomingVisitForm();
                    setIsAddingUpcomingVisit(true);
                  }}
                  className={styles.scheduleButton}
                >
                  Schedule Next Appointment
                </button>
              )}
            </div>
          )}
        </div>
  
        {isAddingPastVisit && (
          <PastVisitForm
            visitData={visitFormData}
            onInputChange={handlePastVisitChange}
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await onAddVisit({ ...visitFormData, isUpcoming: false });
                // Handle document uploads if needed
                if (visitFormData.documents?.length > 0) {
                  await onUploadDocument(visitFormData.documents);
                }
                setIsAddingPastVisit(false);
                resetPastVisitForm();
              } catch (error) {
                console.error('Failed to add visit:', error);
              }
            }}
            onCancel={() => {
              setIsAddingPastVisit(false);
              resetPastVisitForm();
            }}
            isOpen={isAddingPastVisit}
          />
        )}
  
        {editingVisit && (
          <EditPastVisitForm
            visitData={visitFormData}
            onInputChange={handlePastVisitChange}
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await onEditVisit(editingVisit._id, visitFormData);
                // Handle document uploads if needed
                if (visitFormData.documents?.length > 0) {
                  await onUploadDocument(visitFormData.documents);
                }
                setEditingVisit(null);
                resetPastVisitForm();
              } catch (error) {
                console.error('Failed to edit visit:', error);
              }
            }}
            onCancel={() => {
              setEditingVisit(null);
              resetPastVisitForm();
            }}
            isOpen={!!editingVisit}
          />
        )}
  
          {isAddingUpcomingVisit && (
          <UpcomingVisitForm
            visitData={upcomingFormData}
            onInputChange={handleUpcomingVisitChange}
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                if (editingUpcomingVisit) {
                  await onEditVisit(editingUpcomingVisit._id, {
                    ...upcomingFormData,
                    isUpcoming: true
                  });
                  setEditingUpcomingVisit(null);
                } else {
                  await onAddUpcomingVisit({ ...upcomingFormData, isUpcoming: true });
                }
                setIsAddingUpcomingVisit(false);
                resetUpcomingVisitForm();
              } catch (error) {
                console.error('Failed to handle upcoming visit:', error);
              }
            }}
            onCancel={() => {
              setIsAddingUpcomingVisit(false);
              setEditingUpcomingVisit(null);
              resetUpcomingVisitForm();
            }}
            isOpen={isAddingUpcomingVisit}
            isEditing={!!editingUpcomingVisit}
          />
        )}
      </div>
    );
  };

export default VisitManager;