"use client"

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getVets, getPets, createVet, updateVet, deleteVet, getVetPastVisits, getNextAppointment, createPastVisit, updatePastVisit, deletePastVisit, scheduleNextAppointment, updateNextAppointment, deleteNextAppointment  } from '@/lib/api';
import { toast } from 'react-toastify';
import PetTabs from '@/components/VetManager/PetTabs';
import VetTabs from '@/components/VetManager/VetTabs';
import AddVetForm from '@/components/VetManager/VetForms/addVetForm';
import VetSuggestions from '@/components/VetManager/VetSuggestions';
import VetDetailsLayout from '@/components/layouts/VetDetailsLayout';
import styles from './Vets.module.css';

const MyVets = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const petId = searchParams.get('petId');
    const action = searchParams.get('action');

    const [pets, setPets] = useState([]);
    const [selectedPet, setSelectedPet] = useState(null);
    const [vets, setVets] = useState([]);
    const [editingVet, setEditingVet] = useState(null);
    const [activeTab, setActiveTab] = useState('add');
    const [isAddingVet, setIsAddingVet] = useState(false);
    const [selectedVet, setSelectedVet] = useState(null);
    const [existingVets, setExistingVets] = useState([]);
    const [processedVets, setProcessedVets] = useState(new Set());
    const [otherPets, setOtherPets] = useState([]);
    const [visits, setVisits] = useState([]);
    const [pastVisits, setPastVisits] = useState([]);
    const [nextAppointment, setNextAppointment] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        clinicName: '',
        vetName: '',
        address: { street: '', city: '', zipCode: '' },
        contactInfo: { email: '', phone: '' }
    });

    useEffect(() => {
        fetchPets();
    }, []);

    useEffect(() => {
        if (pets.length > 0 && !petId) {
            const firstPet = pets[0];
            router.push(`/myvets?petId=${firstPet._id}`);
        }
    }, [pets]);

    useEffect(() => {
        if (action === 'add') {
            setIsAddingVet(true);
        }
    }, [action]);

    const prepareOtherPets = (selectedPetId) => {
        setOtherPets(pets.filter(pet => pet._id !== selectedPetId));
    };

    useEffect(() => {
        if (petId && pets.length > 0) {
            const pet = pets.find(p => p._id === petId);
            if (pet) {
                setSelectedVet(null);
                setActiveTab('add');
                setSelectedPet(pet);
                prepareOtherPets(pet._id);
                fetchVetsForPet(petId);
            } else {
                toast.error('Pet not found');
                router.push('/myPets');
            }
        }
    }, [petId, pets]);

    useEffect(() => {
        if (petId) {
            setProcessedVets(new Set());
        }
    }, [petId]);

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
            
            // Only update these if we're not already adding a vet
            if (!isAddingVet) {
                if (response.data.length > 0) {
                    setActiveTab(response.data[0]._id);
                    setSelectedVet(response.data[0]);
                    setIsAddingVet(false);
                } else {
                    setActiveTab('add');
                    setSelectedVet(null);
                    setIsAddingVet(true);
                }
            }
        } catch (error) {
            toast.error('Failed to fetch veterinarians');
            if (!isAddingVet) {
                setActiveTab('add');
                setSelectedVet(null);
                setIsAddingVet(true);
            }
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
            const [pastVisitsResponse, nextAppointmentResponse] = await Promise.all([
                getVetPastVisits(selectedPet._id, selectedVet._id),
                getNextAppointment(selectedPet._id, selectedVet._id)
            ]);
    
            setPastVisits(pastVisitsResponse.data || []);
            setNextAppointment(nextAppointmentResponse.data || null);
    
        } catch (error) {
            console.error('Error fetching visits:', error);
            toast.error('Failed to fetch visits');
        }
    };

    const handleTabClick = (vetId) => {
        if (vetId === 'add') {
            setIsAddingVet(prev => !prev);
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

    const handleEditVetFormChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [section, field] = name.split('.');
            setEditingVet(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: value
                }
            }));
        } else {
            setEditingVet(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleAddExistingVet = async (petId, vet) => {
        try {
          // Create a new vet for the current pet using the existing vet's data
          await createVet(petId, {
            clinicName: vet.clinicName,
            vetName: vet.vetName,
            address: vet.address,
            contactInfo: vet.contactInfo
          });

          setProcessedVets(prev => new Set([...prev, vet._id]));
          await fetchVetsForPet(petId);
          toast.success('Veterinarian added successfully');
        } catch (error) {
          toast.error('Failed to add veterinarian');
        }
      };
      
      const handleSkipVet = (vetId) => {
        // Add skipped vet to processed set
        setProcessedVets(prev => new Set([...prev, vetId]));
    };

    const handleAddVet = async (e, selectedPets) => {
        e?.preventDefault();
        try {
            const newVetResponse = await createVet(selectedPet._id, formData);
            
            if (selectedPets && Object.keys(selectedPets).length > 0) {
                const promises = Object.keys(selectedPets)
                    .filter(petId => selectedPets[petId])
                    .map(petId => createVet(petId, formData));
                
                await Promise.all(promises);
                toast.success('Veterinarian added and shared successfully');
            } else {
                toast.success('Veterinarian added successfully');
            }
    
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

    // Visit handlers remain the same
    const handleAddVisit = async (visitData) => {
        try {
            await createPastVisit(selectedPet._id, selectedVet._id, visitData);
            toast.success('Visit added successfully');
            fetchVetVisits();
        } catch (error) {
            toast.error('Failed to add visit');
            throw error;
        }
    };
    
    const handleEditVisit = async (visitId, visitData) => {
        try {
            await updatePastVisit(selectedPet._id, selectedVet._id, visitId, visitData);
            toast.success('Visit updated successfully');
            fetchVetVisits();
        } catch (error) {
            toast.error('Failed to update visit');
            throw error;
        }
    };
    
    const handleDeleteVisit = async (visitId) => {
        if (window.confirm('Are you sure you want to delete this visit?')) {
            try {
                await deletePastVisit(selectedPet._id, selectedVet._id, visitId);
                toast.success('Visit deleted successfully');
                fetchVetVisits();
            } catch (error) {
                toast.error('Failed to delete visit');
                throw error;
            }
        }
    };
    
    const handleAddUpcomingVisit = async (visitData) => {
        try {
            await scheduleNextAppointment(selectedPet._id, selectedVet._id, visitData);
            toast.success('Appointment scheduled successfully');
            fetchVetVisits();
        } catch (error) {
            toast.error('Failed to schedule appointment');
            throw error;
        }
    };
    
    const handleEditUpcomingVisit = async (visitId, visitData) => {
        try {
            await updateNextAppointment(selectedPet._id, selectedVet._id, visitId, visitData);
            toast.success('Appointment updated successfully');
            fetchVetVisits();
        } catch (error) {
            toast.error('Failed to update appointment');
            throw error;
        }
    };
    
    const handleDeleteUpcomingVisit = async (visitId) => {
        if (window.confirm('Are you sure you want to cancel this appointment?')) {
            try {
                await deleteNextAppointment(selectedPet._id, selectedVet._id, visitId);
                toast.success('Appointment cancelled successfully');
                fetchVetVisits();
            } catch (error) {
                toast.error('Failed to cancel appointment');
                throw error;
            }
        }
    };

    return (
        <div className={styles.myVets}>
            <div className={styles.header}>
                <h1>Veterinary Care for {selectedPet?.name}</h1>
                <Link href="/mypets" className={styles.backLink}>
                    Back to Pet Profile
                </Link>
            </div>
    
            {pets.length > 0 ? (
                <>
                    <PetTabs 
                        pets={pets}
                        selectedPetId={petId} 
                        onSelectPet={(petId) => router.push(`/myvets?petId=${petId}`)}
                    />
    
                    {petId && (
                        <>
                            <VetTabs 
                                vets={vets}
                                activeTab={activeTab}
                                onTabClick={handleTabClick}
                                onDeleteVet={handleDeleteVet}
                            />
    
                            <div className={styles.content}>
                                {isLoading ? (
                                    <div className={styles.loading}>Loading...</div>
                                ) : (
                                    isAddingVet && !editingVet ? (
                                        <>
                                        {/* Show suggestions first if there are vets from other pets */}
                                          <VetSuggestions
                                            existingVets={pets
                                              .filter(p => p._id !== selectedPet._id) // Get other pets
                                              .flatMap(p => {
                                                // Get those pets' vets and ensure they have pets populated
                                                return p.vets.map(vet => ({
                                                    ...vet,
                                                    pets: vet.pets || []
                                                }));
                                            })
                                            .filter((vet, index, self) => {
                                                // Keep vet if:
                                                return index === self.findIndex(v => v._id === vet._id) && // Not duplicate
                                                       !vets.some(v => v._id === vet._id) && // Not already added to current pet
                                                       !processedVets.has(vet._id); // Not processed (skipped/added)
                                            })}
                                            currentPet={selectedPet}
                                            onAddExistingVet={(vet) => {
                                            handleAddExistingVet(selectedPet._id, vet);
                                            }}
                                            onSkip={(vetId) => handleSkipVet(vetId)}
                                            />
                                        <AddVetForm
                                            formData={formData}
                                            onChange={handleVetFormChange}
                                            onSubmit={handleAddVet}
                                            onCancel={() => setIsAddingVet(false)}
                                            isEditing={false}
                                            otherPets={otherPets}
                                            existingVets={vets.filter(v => 
                                                !v.pets.includes(selectedPet._id)
                                            )}
                                            isOpen={true}
                                        />
                                        </>
                                    ) : selectedVet ? (
                                        <VetDetailsLayout
                                            vet={selectedVet}
                                            pastVisits={pastVisits}
                                            nextAppointment={nextAppointment}
                                            onEdit={() => setEditingVet(selectedVet)}
                                            onDelete={() => handleDeleteVet(selectedVet._id)}
                                            onAddPastVisit={handleAddVisit}
                                            onEditPastVisit={handleEditVisit}
                                            onDeletePastVisit={handleDeleteVisit}
                                            onAddNextAppointment={handleAddUpcomingVisit}
                                            onEditNextAppointment={handleEditUpcomingVisit}
                                            onDeleteNextAppointment={handleDeleteUpcomingVisit}
                                        />
                                    ) : (
                                        <div className={styles.noVetSelected}>
                                            <p>No veterinarian selected. Click the "+" tab to add a new veterinarian.</p>
                                        </div>
                                    )
                                )}
                            </div>
                        </>
                    )}
                </>
            ) : (
                <div className={styles.noPets}>
                    <p>You need to add a pet first before managing veterinary care.</p>
                    <Link href="/mypets" className={styles.addPetLink}>
                        Add a Pet
                    </Link>
                </div>
            )}
    
            {editingVet && (
                <AddVetForm
                    formData={editingVet}
                    onChange={handleEditVetFormChange}
                    onSubmit={handleUpdateVet}
                    onCancel={() => setEditingVet(null)}
                    isEditing={true}
                    isOpen={true}
                    otherPets={[]}
                    existingVets={[]}
                />
            )}
        </div>
    );
};

export default MyVets;