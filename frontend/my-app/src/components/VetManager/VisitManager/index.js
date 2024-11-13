"use client"

import React, { useState } from 'react';
import PastVisitsList from './PastVisits/pastVisitsList';
import NextVisitCard from './NextAppointment/upcomingVisitCard';
import PastVisitForm from './VetVisitForms/pastVisitForm';
import UpcomingVisitForm from './VetVisitForms/upcomingVisitForm';
import UpcomingVisitCard from './NextAppointment/upcomingVisitCard';
import styles from './VisitManager.module.css';

const VisitManager = ({
  pastVisits,          
  nextAppointment,
  onAddPastVisit,
  onEditPastVisit,
  onDeletePastVisit,
  onAddNextAppointment,
  onEditNextAppointment,
  onDeleteNextAppointment,
  onUploadDocument,
}) => {
  const [activeTab, setActiveTab] = useState('past');
  const [isAddingPastVisit, setIsAddingPastVisit] = useState(false);
  const [isAddingNextAppointment, setIsAddingNextAppointment] = useState(false);
  const [editingNextAppointment, setEditingNextAppointment] = useState(null);
  const [editingPastVisit, setEditingPastVisit] = useState(null);
  const [visitFormData, setVisitFormData] = useState({
    dateOfVisit: '',
    reason: '',
    notes: '',
    documents: []
  });

  const [appointmentFormData, setAppointmentFormData] = useState({
    dateScheduled: '',
    reason: '',
    notes: ''
  });  

    // Handler for past visit form changes
    const handlePastVisitChange = (e) => {
      const { name, value } = e.target;
      setVisitFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };
  
    // Handler for upcoming visit form changes
    const handleAppointmentChange  = (e) => {
      const { name, value } = e.target;
      setAppointmentFormData(prev => ({
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
  
    const resetAppointmentForm = () => {
      setAppointmentFormData({
        dateScheduled: '',
        reason: '',
        notes: ''
      });
    };
  
  // Handle edit functions
  const handleEditPastVisit  = (visit) => {
      const formattedDate = new Date(visit.dateOfVisit).toISOString().split('T')[0];
      setEditingPastVisit(visit);
      setVisitFormData({
        dateOfVisit: formattedDate,
        reason: visit.reason,
        notes: visit.notes,
        documents: visit.documents || []
      });
    };

    const handleEditNextAppointment = (appointment) => {
      const formattedDate = new Date(appointment.dateScheduled).toISOString().split('T')[0];
      setEditingNextAppointment(appointment);
      setAppointmentFormData({
        dateScheduled: formattedDate,
        reason: appointment.reason,
        notes: appointment.notes
      });
      setIsAddingNextAppointment(true);
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
                pastVisits={pastVisits}
                onEditVisit={handleEditPastVisit}
                onDeleteVisit={onDeletePastVisit}
              />
            </>
          ) : (
            <div className={styles.upcomingVisitSection}>
              {nextAppointment ? (
                <UpcomingVisitCard
                  appointment={nextAppointment}
                  onCancel={() => onDeleteNextAppointment(nextAppointment._id)}
                  onEdit={handleEditNextAppointment}
                />
              ) : (
                <button 
                  onClick={() => {
                    resetAppointmentForm();
                    setIsAddingNextAppointment(true);
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
                const formattedDate = new Date(visitFormData.dateOfVisit);
                // Check if date is in the past
                if (formattedDate > new Date()) {
                  throw new Error('Past visit date cannot be in the future');
                }
                
                await onAddPastVisit(visitFormData);
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
            isEditing={false}
            />
        )}
    
        {editingPastVisit && (
          <PastVisitForm
            visitData={visitFormData}
            onInputChange={handlePastVisitChange}
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await onEditPastVisit(editingPastVisit._id, visitFormData);
                setEditingPastVisit(null);
                resetPastVisitForm();
              } catch (error) {
                console.error('Failed to edit visit:', error);
              }
            }}
            onCancel={() => {
              setEditingPastVisit(null);
              resetPastVisitForm();
            }}
            isOpen={!!editingPastVisit}
            isEditing={true}
          />
        )}
    
        {isAddingNextAppointment && (
          <UpcomingVisitForm
          appointmentData={appointmentFormData}
            onInputChange={handleAppointmentChange}
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const formattedDate = new Date(appointmentFormData.dateScheduled);
                // Check if date is in the future
                if (formattedDate <= new Date()) {
                  throw new Error('Next appointment date must be in the future');
                }
    
                if (editingNextAppointment) {
                  await onEditNextAppointment(editingNextAppointment._id, appointmentFormData);
                  setEditingNextAppointment(null);
                } else {
                  await onAddNextAppointment(appointmentFormData);
                }
                setIsAddingNextAppointment(false);
                resetAppointmentForm();
              } catch (error) {
                console.error('Failed to handle appointment:', error);
              }
            }}
            onCancel={() => {
              setIsAddingNextAppointment(false);
              setEditingNextAppointment(null);
              resetAppointmentForm();
            }}
            isOpen={isAddingNextAppointment}
            isEditing={!!editingNextAppointment}
          />
        )}
      </div>
    );
};

export default VisitManager;