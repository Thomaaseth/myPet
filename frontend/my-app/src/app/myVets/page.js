"use client"

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getVets, getPets, createVet, updateVet, deleteVet, getVetVisits, createVetVisit, updateVetVisit, deleteVetVisit } from '@/lib/api';
import { toast } from 'react-toastify';
import VetTabs from '@/components/VetManager/VetTabs';
import AddVetForm from '@/components/VetManager/VetForms/addVetForm';
import EditVetForm from '@/components/VetManager/VetForms/editVetForm';
// import AddVisitForm from '@/components/VetManager/VetVisitForms/addVisitForm';
// import EditVisitForm from '@/components/VetManager/VetVisitForms/editVisitForm';
// import VetProfile from '@/components/VetManager/components/VetProfile';
import VetDetailsLayout from '@/components/layouts/VetDetailsLayout';
import styles from './Vets.module.css';

const MyVets = ({ pet }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const petId = searchParams.get('petId');
    const action = searchParams.get('action');

    const [pets, setPets] = useState([]);
    const [selectedPet, setSelectedPet] = useState(null);
    const [vets, setVets] = useState([]);
    const [editingVet, setEditingVet] = useState(null);

    const [activeTab, setActiveTab] = useState('add');
    const [isAddingVet, setIsAddingVet] = useState(true);
    const [selectedVet, setSelectedVet] = useState(null);
    const [showDocuments, setShowDocuments] = useState(false);
    const [visits, setVisits] = useState([]);
    const [editingVisit, setEditingVisit] = useState(null);
    const [isVisitFormOpen, setIsVisitFormOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
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

    // Fetch all pets
    useEffect(() => {
        fetchPets();
    }, []);

    useEffect(() => {
        if (action === 'add') {
            setIsAddingVet(true);
        }
    }, [action]);

    // When we have petId and pets, set the selected pet
    useEffect(() => {
        if (petId && pets.length > 0) {
            const pet = pets.find(p => p._id === petId);
            if (pet) {
                setSelectedPet(pet);
                fetchVetsForPet(petId);
            } else {
                toast.error('Pet not found');
                router.push('/myPets');
            }
        }
    }, [petId, pets]);

    const fetchPets = async () => {
        try {
            const response = await getPets();
            setPets(response.data);
        } catch (error) {
            toast.error('Failed to fetch pets');
        }
    };

    const fetchVetsForPet = async (id) => {
        setIsLoading(true);
        try {
            const response = await getVets(id);
            setVets(response.data);
            if (response.data.length > 0) {
                setActiveTab(response.data[0]._id);
                setSelectedVet(response.data[0]);
                setIsAddingVet(false);
            }
        } catch (error) {
            toast.error('Failed to fetch veterinarians');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (selectedVet && selectedPet) {
            fetchVetVisits();
        }
    }, [selectedVet]);
    
    const fetchVetVisits = async () => {
        if (!selectedVet) return;
        try {
            const response = await getVetVisits(selectedPet._id, selectedVet._id);
            setVisits(response.data);
        } catch (error) {
            toast.error('Failed to fetch visits');
        }
    };

       // If no pet is selected, show pet selector
       if (!petId) {
        return (
            <div className={styles.myVets}>
                <h1>My Veterinarians</h1>
                <div className={styles.petSelector}>
                    <h2>Select a Pet</h2>
                    {pets.length > 0 ? (
                        <>
                            <p>Please select a pet to manage their veterinary care:</p>
                            <select 
                                onChange={(e) => router.push(`/myVets?petId=${e.target.value}`)}
                                className={styles.petSelect}
                            >
                                <option value="">Choose a pet...</option>
                                {pets.map(pet => (
                                    <option key={pet._id} value={pet._id}>
                                        {pet.name}
                                    </option>
                                ))}
                            </select>
                        </>
                    ) : (
                        <div className={styles.noPets}>
                            <p>You need to add a pet first before managing veterinary care.</p>
                            <Link href="/mypets" className={styles.addPetLink}>
                                Add a Pet
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        );
    }

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
            await createVet(selectedPet._id, formData);
            toast.success('Veterinarian added successfully');
            fetchVetsForPet(selectedPet._id);
            resetForm();
            setIsAddingVet(false);
        } catch (error) {
            toast.error('Failed to add veterinarian');
        }
    };

    const handleUpdateVet = async (e) => {
        e.preventDefault();
        try {
            await updateVet(selectedPet._id, editingVet._id, editingVet);
            toast.success('Veterinarian updated successfully');
            fetchVetsForPet(selectedPet._id);
            setEditingVet(null);
        } catch (error) {
            toast.error('Failed to update veterinarian');
        }
    };

    const handleDeleteVet = async (vetId) => {
        if (window.confirm('Are you sure you want to remove this veterinarian?')) {
            try {
                await deleteVet(selectedPet._id, vetId);
                toast.success('Veterinarian removed successfully');
                fetchVetsForPet(selectedPet._id);
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
                await updateVetVisit(selectedPet._id, selectedVet._id, editingVisit._id, visitFormData);
                toast.success('Visit updated successfully');
            } else {
                await createVetVisit(selectedPet._id, selectedVet._id, visitFormData);
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
                await deleteVetVisit(selectedPet._id, selectedVet._id, visitId);
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

    return (
        <div className={styles.myVets}>
            <div className={styles.header}>
                <h1>Veterinary Care for {selectedPet?.name}</h1>
                <Link href={`/mypets`} className={styles.backLink}>
                    Back to Pet Profile
                </Link>
            </div>
            
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
                ) : selectedVet ? (
                    <VetDetailsLayout
                        vet={selectedVet}
                        visits={visits}
                        onEdit={() => setEditingVet(selectedVet)}
                        onDelete={() => handleDeleteVet(selectedVet._id)}
                        onEditVisit={handleEditVisit}
                        onDeleteVisit={handleDeleteVisit}
                        onAddVisit={() => {
                            setEditingVisit(null);
                            setIsVisitFormOpen(true);
                        }}
                        showDocuments={showDocuments}
                        onToggleDocuments={handleToggleDocuments}
                        onUploadDocument={handleUploadDocument}
                        visitFormData={visitFormData}
                        onVisitFormChange={handleVisitFormChange}
                        onVisitSubmit={handleVisitSubmit}
                        onVisitCancel={() => {
                            setEditingVisit(null);
                            setIsVisitFormOpen(false);
                        }}
                        isVisitFormOpen={isVisitFormOpen}
                        editingVisit={editingVisit}
                    />
                ) : null }
            </div>

            {editingVet && (
                <EditVetForm
                    formData={editingVet}
                    onChange={handleVetFormChange}
                    onSubmit={handleUpdateVet}
                    onCancel={() => setEditingVet(null)}
                />
            )}
        </div>
    );
};

export default MyVets;