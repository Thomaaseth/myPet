"use client"

import React, { useState, useEffect } from "react";
import { getPets, createPet, updatePet, deletePet, getSpeciesList } from '../../lib/api'
import WeightTracker from "@/components/WeightTracker";
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
        
        {/* Pet Tabs Navigation */}
        <div className={styles.petTabs}>
          {pets.map((pet, index) => (
            <button
              key={pet._id}
              className={`${styles.petTab} ${selectedPetId === pet._id ? styles.active : ''}`}
              onClick={() => setSelectedPetId(pet._id)}
            >
              {`${pet.name}`}
            </button>
          ))}
          <button 
            className={`${styles.petTab} ${styles.addPetTab}`}
            onClick={toggleForm}
          >
            + Add New Pet
          </button>
        </div>
  
        {/* Add Pet Form */}
        {isFormVisible && (
          <div className={styles.addPetFormContainer}>
            <form onSubmit={handleCreatePet} className={styles.addPetForm}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Pet Name:</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={newPet.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
  
              <div className={styles.formGroup}>
                <label htmlFor="species">Species:</label>
                <select
                  id="species"
                  name="species"
                  value={newPet.species}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a species</option>
                  {Object.entries(speciesList.categories).map(([category, species]) => (
                    <optgroup key={category} label={category.replace(/_/g, ' ')}>
                      {Object.entries(species).map(([key, value]) => (
                        <option key={key} value={value}>
                          {value.charAt(0).toUpperCase() + value.slice(1)}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
  
              <div className={styles.formGroup}>
                <label htmlFor="birthDate">Birth Date:</label>
                <input
                  id="birthDate"
                  type="date"
                  name="birthDate"
                  value={newPet.birthDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
  
              <div className={styles.formGroup}>
                <label htmlFor="weight">Weight (kg):</label>
                <input
                  id="weight"
                  type="number"
                  name="weight"
                  value={newPet.weight}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  required
                />
              </div>
  
              <div className={styles.formGroup}>
                <label htmlFor="image">Pet Image:</label>
                <input
                  id="image"
                  type="file"
                  name="image"
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </div>
  
              <button type="submit">Add Pet</button>
            </form>
          </div>
        )}
  
        {/* Selected Pet Details */}
        {selectedPet && (
          <div className={styles.petDetails}>
            <div className={styles.petHeader}>
              <h2>{selectedPet.name}</h2>
              <div className={styles.petActions}>
                <button onClick={() => handleEditClick(selectedPet)}>Edit</button>
                <button onClick={() => handleDeletePet(selectedPet._id)}>Delete</button>
              </div>
            </div>
  
            <div className={styles.petContent}>
              <div className={styles.petInfo}>
                <div className={styles.petImageContainer}>
                  {selectedPet.imageUrl && (
                    <img
                      src={selectedPet.imageUrl}
                      alt={selectedPet.name}
                      className={styles.petImage}
                    />
                  )}
                </div>
                
                <div className={styles.petStats}>
                  <div className={styles.statItem}>
                    <label>Species:</label>
                    <span>{selectedPet.species}</span>
                  </div>
                  <div className={styles.statItem}>
                    <label>Age:</label>
                    <span>{selectedPet.age} years</span>
                  </div>
                  <div className={styles.statItem}>
                    <label>Birth Date:</label>
                    <span>{new Date(selectedPet.birthDate).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.statItem}>
                    <label>Weight:</label>
                    <span>{selectedPet.weight} kg</span>
                  </div>
                </div>
              </div>

              {/* WeightTracker component */}
              <div className={styles.weightTrackerContainer}>
                <WeightTracker 
                  petId={selectedPet._id}
                  initialWeight={selectedPet.weight}
                />
              </div>
  
              {/* Edit Form */}
              {editingPet && editingPet._id === selectedPet._id && (
                <div className={styles.editFormOverlay}>
                  <form onSubmit={handleUpdatePet} className={styles.editPetForm}>
                    <input
                      type="text"
                      name="name"
                      value={editingPet.name}
                      onChange={(e) => handleInputChange(e, true)}
                      required
                    />
                    
                    <select
                      name="species"
                      value={editingPet.species}
                      onChange={(e) => handleInputChange(e, true)}
                      required
                    >
                      <option value="dog">Dog</option>
                      <option value="cat">Cat</option>
                      <option value="bird">Bird</option>
                    </select>
  
                    <input
                      type="date"
                      name="birthDate"
                      value={editingPet.birthDate}
                      onChange={(e) => handleInputChange(e, true)}
                      required
                    />
  
                    <input
                      type="number"
                      name="weight"
                      value={editingPet.weight}
                      onChange={(e) => handleInputChange(e, true)}
                      min="0"
                      step="0.1"
                      required
                    />
  
                    <div>
                      <p>Current Image: {editingPet.currentImage || 'No image uploaded'}</p>
                      <input
                        type="file"
                        name="image"
                        onChange={(e) => handleFileChange(e, true)}
                        accept="image/*"
                      />
                    </div>
  
                    <button type="submit">Save</button>
                    <button type="button" onClick={() => setEditingPet(null)}>Cancel</button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
    
    export default MyPets;