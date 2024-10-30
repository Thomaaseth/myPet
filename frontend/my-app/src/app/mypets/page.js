"use client"

import React, { useState, useEffect } from "react";
import { getPets, createPet, updatePet, deletePet, getSpeciesList } from '../../lib/api'
import WeightTracker from "@/components/WeightTracker/index";
import PetDetailsLayout from '@/components/layouts/PetDetailsLayout';
import PetTabs from "@/components/PetTabs";
import AddPetForm from "@/components/PetForms/addPetForm";
import EditPetForm from "@/components/PetForms/editPetForm";
import { toast } from "react-toastify";
import styles from './Pets.module.css'
import { TOAST_MESSAGES } from "@/utils/toastMessage";

const MyPets = () => {
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [speciesList, setSpeciesList] = useState({ categories: {}, flatList: [] });
  const [newPet, setNewPet] = useState({
      name: '',
      species: '',
      birthDate: '',
      weight: '',
      image: null
  });
  const [editingPet, setEditingPet] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
      fetchPets();
  }, []);

  useEffect(() => {
    const fetchSpeciesList = async () => {
      try {
        const response = await getSpeciesList();
        setSpeciesList(response.data);
      } catch (error) {
        console.error('Error fetching species list:', error);
        toast.error('Failed to load species list');
      }
    };

    fetchSpeciesList();
  }, []);

  // Set first pet as selected when pets are loaded
  useEffect(() => {
    if (pets.length > 0 && !selectedPetId) {
      setSelectedPetId(pets[0]._id);
    }
  }, [pets]);

  const fetchPets = async () => {
    try {
      const fetchedPets = await getPets();
      setPets(fetchedPets.data);
    } catch (error) {
      console.error("Error fetching pets:", error);
      toast.error("Failed to fetch pets. Please try again.");
    }
  };

  const handleInputChange = (e, isEditing = false) => {
    const { name, value } = e.target;
    if (isEditing) {
      setEditingPet(prev => ({ ...prev, [name]: value }));
    } else {
      setNewPet(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e, isEditing = false) => {
    if (isEditing) {
      setEditingPet(prev => ({ ...prev, image: e.target.files[0] }));
    } else {
      setNewPet(prev => ({ ...prev, image: e.target.files[0] }));
    }
  };

  const handleCreatePet = async (e) => {
    e.preventDefault();
    try {
      await createPet(newPet);
      fetchPets();
      setNewPet({
        name: '',
        species: '',
        birthDate: '',
        weight: '',
        image: null
      });
      toast.success(TOAST_MESSAGES.PET_CREATED_SUCCESS);
    } catch (error) {
      console.error("Error creating pet:", error);
      toast.error(TOAST_MESSAGES.PET_CREATED_FAIL);
    }
  };

  const handleUpdatePet = async (e) => {
    e.preventDefault();
    try {
      await updatePet(editingPet._id, editingPet);
      fetchPets();
      setEditingPet(null);
      toast.success(TOAST_MESSAGES.PET_UPDATE_SUCCESS);
    } catch (error) {
      console.error("Error updating pet:", error);
      toast.error(TOAST_MESSAGES.PET_UPDATE_FAIL);
    }
  };

  const handleDeletePet = async (id) => {
    try {
      await deletePet(id);
      fetchPets();
      toast.success(TOAST_MESSAGES.PET_DELETE_SUCCESS);
    } catch (error) {
      console.error("Error deleting pet:", error);
      toast.error(TOAST_MESSAGES.PET_DELETE_FAIL);
    }
  };


    const toggleForm = () => {
        setIsFormVisible(!isFormVisible);
    };

    const calculateAge = (birthDate) => {
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          age--;
        }
        
        return age;
      };

    const formatDateForInput = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };


    const handleEditClick = (pet) => {
        setEditingPet({
          ...pet,
          birthDate: formatDateForInput(pet.birthDate),
          currentImage: pet.imageUrl ? getFileName(pet.imageUrl) : null
        });
      };

    const getFileName = (path) => {
        return path.split('/').pop();
    };
    
    const handleViewImage = (imageUrl) => {
        window.open(imageUrl, '_blank');
    };

    const selectedPet = pets.find(pet => pet._id === selectedPetId);

    return (
      <div className={styles.myPets}>
        <h1>My Pets</h1>
        
        <PetTabs 
          pets={pets}
          selectedPetId={selectedPetId}
          onSelectPet={setSelectedPetId}
          onAddPet={toggleForm}
        />
  
        {isFormVisible && (
          <AddPetForm
            newPet={newPet}
            speciesList={speciesList}
            onInputChange={handleInputChange}
            onFileChange={handleFileChange}
            onSubmit={handleCreatePet}
          />
        )}
  
        {selectedPet && (
          <PetDetailsLayout
            pet={selectedPet}
            onEdit={() => handleEditClick(selectedPet)}
            onDelete={() => handleDeletePet(selectedPet._id)}
          >
            <WeightTracker 
              petId={selectedPet._id}
              initialWeight={selectedPet.weight}
            />
          </PetDetailsLayout>
        )}
  
        {editingPet && editingPet._id === selectedPet._id && (
          <EditPetForm
            editingPet={editingPet}
            speciesList={speciesList}
            onInputChange={(e) => handleInputChange(e, true)}
            onFileChange={(e) => handleFileChange(e, true)}
            onSubmit={handleUpdatePet}
            onCancel={() => setEditingPet(null)}
          />
        )}
      </div>
    );
  }
  
    export default MyPets;