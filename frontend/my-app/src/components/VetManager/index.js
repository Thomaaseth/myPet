"use client"

import React, { useState, useEffect } from 'react';
import { getVets, createVet, updateVet, deleteVet, getVetVisits, createVetVisit, updateVetVisit, deleteVetVisit } from '@/lib/api';
import { toast } from 'react-toastify';
import VetTabs from './VetTabs/index';
import AddVetForm from './VetForms/addVetForm';
import EditVetForm from './VetForms/editVetForm';
import AddVisitForm from './VetVisitForms/addVisitForm';
import EditVisitForm from './VetVisitForms/editVisitForm';
import styles from './VetManager.module.css';

const VetManager = ({ pet }) => {
    const [vets, setVets] = useState([]);
    const [activeTab, setActiveTab] = useState('add');
    const [isAddingVet, setIsAddingVet] = useState(true);
    const [selectedVet, setSelectedVet] = useState(null);
    const [showDocuments, setShowDocuments] = useState(false);
    const [visits, setVisits] = useState([]);
    const [editingVisit, setEditingVisit] = useState(null);
    const [isVisitFormOpen, setIsVisitFormOpen] = useState(false);
    const [formData, setFormData] = useState({
        clinicName: '',
        vetName: '',
        address: { street: '', city: '', zipCode: '' },
        contactInfo: { email: '', phone: '' }
    });
    const [visitFormData, setVisitFormData] = useState({
        dateOfVisit: '',
        nextAppointment: '',
        reason: '',
        notes: '',
        prescriptions: []
    });

    useEffect(() => {
        fetchVets();
    }, [pet._id]);

    useEffect(() => {
        if (selectedVet) {
            fetchVetVisits();
        }
    }, [selectedVet]);

    const fetchVets = async () => {
        try {
            const response = await getVets(pet._id);
            setVets(response.data);
            if (response.data.length > 0) {
                setActiveTab(response.data[0]._id);
                setSelectedVet(response.data[0]);
                setIsAddingVet(false);
            }
        } catch (error) {
            toast.error('Failed to fetch veterinarians');
        }
    };

    const fetchVetVisits = async () => {
        if (!selectedVet) return;
        try {
            const response = await getVetVisits(pet._id, selectedVet._id);
            setVisits(response.data);
        } catch (error) {
            toast.error('Failed to fetch visits');
        }
    };

    const handleTabClick = (vetId) => {
        if (vetId === 'add') {
            setIsAddingVet(true);
            setSelectedVet(null);
            resetForm();
        } else {
            setIsAddingVet(false);
            const vet = vets.find(v => v._id === vetId);
            if (vet) {
                setSelectedVet(vet);
            }
        }
        setActiveTab(vetId);
    };

    const resetForm = () => {
        setFormData({
            clinicName: '',
            vetName: '',
            address: { street: '', city: '', zipCode: '' },
            contactInfo: { email: '', phone: '' }
        });
        setVisitFormData({
            dateOfVisit: '',
            nextAppointment: '',
            reason: '',
            notes: '',
            prescriptions: []
        });
    };

    const handleVetFormChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [section, field] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleVisitFormChange = (e) => {
        const { name, value } = e.target;
        setVisitFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddVet = async (e) => {
        e.preventDefault();
        try {
            await createVet(pet._id, formData);
            toast.success('Veterinarian added successfully');
            fetchVets();
            resetForm();
        } catch (error) {
            toast.error('Failed to add veterinarian');
        }
    };

    const handleDeleteVet = async (vetId) => {
        if (window.confirm('Are you sure you want to remove this veterinarian?')) {
            try {
                await deleteVet(pet._id, vetId);
                toast.success('Veterinarian removed successfully');
                fetchVets();
                setSelectedVet(null);
                setIsAddingVet(true);
            } catch (error) {
                toast.error('Failed to remove veterinarian');
            }
        }
    };

    const handleVisitSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingVisit) {
                await updateVetVisit(pet._id, selectedVet._id, editingVisit._id, visitFormData);
                toast.success('Visit updated successfully');
            } else {
                await createVetVisit(pet._id, selectedVet._id, visitFormData);
                toast.success('Visit added successfully');
            }
            fetchVetVisits();
            setEditingVisit(null);
            setIsVisitFormOpen(false);
            setVisitFormData({
                dateOfVisit: '',
                nextAppointment: '',
                reason: '',
                notes: '',
                prescriptions: []
            });
        } catch (error) {
            toast.error(editingVisit ? 'Failed to update visit' : 'Failed to add visit');
        }
    };

    const handleDeleteVisit = async (visitId) => {
        if (window.confirm('Are you sure you want to delete this visit?')) {
            try {
                await deleteVetVisit(pet._id, selectedVet._id, visitId);
                toast.success('Visit deleted successfully');
                fetchVetVisits();
            } catch (error) {
                toast.error('Failed to delete visit');
            }
        }
    };

    const handleEditVisit = (visit) => {
        setEditingVisit(visit);
        setIsVisitFormOpen(true);
        setVisitFormData({
            dateOfVisit: visit.dateOfVisit.split('T')[0],
            nextAppointment: visit.nextAppointment ? visit.nextAppointment.split('T')[0] : '',
            reason: visit.reason,
            notes: visit.notes,
            prescriptions: visit.prescriptions || []
        });
    };

    const handleToggleDocuments = () => {
        setShowDocuments(!showDocuments);
    };

    const handleUploadDocument = async (files) => {
        // Document upload logic here
    };

    const renderVetInfo = (vet) => {
        if (!vet) return null;

        return (
            <div className={styles.vetInfo}>
                <div className={styles.infoSection}>
                    <h3>{vet.clinicName}</h3>
                    <p>{vet.vetName}</p>
                    <p>{vet.address?.street}</p>
                    <p>{`${vet.address?.city || ''}, ${vet.address?.zipCode || ''}`}</p>
                    <p>Email: {vet.contactInfo?.email}</p>
                    <p>Phone: {vet.contactInfo?.phone}</p>
                </div>
                
                <div className={styles.visitSection}>
                    <h4>Visits</h4>
                    <div className={styles.visitList}>
                        {visits.map(visit => (
                            <div key={visit._id} className={styles.visitItem}>
                                <p>Date: {new Date(visit.dateOfVisit).toLocaleDateString()}</p>
                                {visit.nextAppointment && (
                                    <p>Next: {new Date(visit.nextAppointment).toLocaleDateString()}</p>
                                )}
                                <p>Reason: {visit.reason}</p>
                                <div className={styles.visitActions}>
                                    <button onClick={() => handleEditVisit(visit)}>Edit</button>
                                    <button onClick={() => handleDeleteVisit(visit._id)}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button 
                        className={styles.addButton}
                        onClick={() => {
                            setEditingVisit(null);
                            setIsVisitFormOpen(true);
                        }}
                    >
                        Add Visit
                    </button>
                </div>

                <div className={styles.documentSection}>
                    <button 
                        className={styles.documentsButton}
                        onClick={handleToggleDocuments}
                    >
                        Documents
                    </button>
                    <input
                        type="file"
                        onChange={(e) => handleUploadDocument(e.target.files)}
                        style={{ display: 'none' }}
                        id="document-upload"
                        multiple
                    />
                    <label 
                        htmlFor="document-upload" 
                        className={styles.uploadButton}
                    >
                        Upload
                    </label>
                </div>

                {showDocuments && (
                    <div className={styles.documentsContainer}>
                        {/* Documents list */}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={styles.vetManager}>
            <VetTabs
                vets={vets}
                activeTab={activeTab}
                onTabClick={handleTabClick}
                onDeleteVet={handleDeleteVet}
            />

            <div className={styles.content}>
                {isAddingVet ? (
                    <AddVetForm
                        formData={formData}
                        onChange={handleVetFormChange}
                        onSubmit={handleAddVet}
                    />
                ) : (
                    renderVetInfo(selectedVet)
                )}
            </div>

            <AddVisitForm
                visitData={visitFormData}
                onInputChange={handleVisitFormChange}
                onSubmit={handleVisitSubmit}
                onCancel={() => {
                    setIsVisitFormOpen(false);
                    setVisitFormData({
                        dateOfVisit: '',
                        nextAppointment: '',
                        reason: '',
                        notes: '',
                        prescriptions: []
                    });
                }}
                isOpen={isVisitFormOpen && !editingVisit}
            />

            <EditVisitForm
                visitData={visitFormData}
                onInputChange={handleVisitFormChange}
                onSubmit={handleVisitSubmit}
                onCancel={() => {
                    setEditingVisit(null);
                    setIsVisitFormOpen(false);
                }}
                isOpen={isVisitFormOpen && editingVisit}
            />
        </div>
    );
};

export default VetManager;