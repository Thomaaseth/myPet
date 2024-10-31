"use client"

import React, { useState, useEffect } from 'react';
import { getVets, createVet, updateVet, deleteVet } from '@/lib/api';
import { toast } from 'react-toastify';
import styles from './VetManager.module.css';

const VetManager = ({ pet }) => {
    const [vets, setVets] = useState([]);
    const [activeTab, setActiveTab] = useState('add');
    const [isAddingVet, setIsAddingVet] = useState(true);
    const [selectedVet, setSelectedVet] = useState(null);
    const [formData, setFormData] = useState({
        clinicName: '',
        vetName: '',
        address: {
            street: '',
            city: '',
            zipCode: ''
        },
        contactInfo: {
            email: '',
            phone: ''
        }
    });

    useEffect(() => {
        fetchVets();
    }, []);

    const fetchVets = async () => {
        try {
            const response = await getVets();
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

    const handleTabClick = (vetId) => {
        if (vetId === 'add') {
            setIsAddingVet(true);
            resetForm();
        } else {
            setIsAddingVet(false);
            setSelectedVet(vets.find(v => v._id === vetId));
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
    };

    const handleChange = (e) => {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createVet(formData);
            toast.success('Veterinarian added successfully');
            fetchVets();
            resetForm();
        } catch (error) {
            toast.error('Failed to add veterinarian');
        }
    };

    const renderVetInfo = (vet) => (        
        <div className={styles.vetInfo}>
            <div className={styles.infoSection}>
                <h3>{vet.clinicName}</h3>
                <p>{vet.vetName}</p>
                <p>{vet.address.street}</p>
                <p>{`${vet.address.city}, ${vet.address.zipCode}`}</p>
                <p>Email: {vet.contactInfo.email}</p>
                <p>Phone: {vet.contactInfo.phone}</p>
            </div>
            
            <div className={styles.visitSection}>
                <div className={styles.visitInfo}>
                    <p>Last Visit: {vet.lastVisit || 'No visits yet'}</p>
                    <p>Next Visit: {vet.nextVisit || 'None scheduled'}</p>
                    {vet.nextVisit && (
                        <div className={styles.visitActions}>
                            <button onClick={() => handleEditVisit(vet._id)}>Edit</button>
                            <button onClick={() => handleDeleteVisit(vet._id)}>Delete</button>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.documentSection}>
                <button 
                    className={styles.documentsButton}
                    onClick={() => handleToggleDocuments(vet._id)}
                >
                    Documents
                </button>
                <button 
                    className={styles.uploadButton}
                    onClick={() => handleUploadDocument(vet._id)}
                >
                    Upload
                </button>
            </div>
        </div>
    );

    const renderVetForm = () => (
        <form onSubmit={handleSubmit} className={styles.vetForm}>
            <div className={styles.formGroup}>
                <label>Clinic Name:</label>
                <input
                    type="text"
                    name="clinicName"
                    value={formData.clinicName}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label>Veterinarian Name:</label>
                <input
                    type="text"
                    name="vetName"
                    value={formData.vetName}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label>Street:</label>
                <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                />
            </div>

            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label>City:</label>
                    <input
                        type="text"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleChange}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Zip Code:</label>
                    <input
                        type="text"
                        name="address.zipCode"
                        value={formData.address.zipCode}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className={styles.formGroup}>
                <label>Email:</label>
                <input
                    type="email"
                    name="contactInfo.email"
                    value={formData.contactInfo.email}
                    onChange={handleChange}
                />
            </div>

            <div className={styles.formGroup}>
                <label>Phone:</label>
                <input
                    type="tel"
                    name="contactInfo.phone"
                    value={formData.contactInfo.phone}
                    onChange={handleChange}
                    required
                />
            </div>

            <button type="submit">Add Veterinarian</button>
        </form>
    );

    return (
        <div className={styles.vetManager}>
            <div className={styles.tabs}>
                {vets.map(vet => (
                    <button
                        key={vet._id}
                        className={`${styles.tab} ${activeTab === vet._id ? styles.active : ''}`}
                        onClick={() => handleTabClick(vet._id)}
                    >
                        {vet.clinicName}
                    </button>
                ))}
                <button
                    className={`${styles.tab} ${activeTab === 'add' ? styles.active : ''}`}
                    onClick={() => handleTabClick('add')}
                >
                    + Add Vet
                </button>
            </div>

            <div className={styles.content}>
                {isAddingVet ? renderVetForm() : renderVetInfo(selectedVet)}
            </div>
        </div>
    );
};

export default VetManager;