"use client"

import React, { useState, useEffect } from "react";
import { getPets, createPet, updatePet, deletePet } from '../../lib/api'
import { toast } from "react-toastify";
import styles from './Pets.module.css'
import { TOAST_MESSAGES } from "@/utils/toastMessage";

const MyPets = () => {
  const [pets, setPets] = useState([]);
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

    return (
        <div className={styles.myPets}>
          <h1>My Pets</h1>
          
          <button onClick={toggleForm} className={styles.toggleFormButton}>
            {isFormVisible ? 'Hide Add Pet Form' : 'Add New Pet'}
          </button>
    
          {isFormVisible && (
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
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="bird">Bird</option>
                  {/* Add more species options based on your allowed species */}
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
          )}
    
          <div className={styles.petList}>
            {pets.map(pet => (
              <div key={pet._id} className={styles.petCard}>
                <div className={styles.petCardInner}>
                  <div className={styles.petCardFront}>
                    <h3>{pet.name}</h3>
                    <p>Species: {pet.species}</p>
                    <p>Age: {pet.age} years</p>
                    {pet.imageUrl && (
                      <img 
                        src={pet.imageUrl} 
                        alt={pet.name} 
                        className={styles.petImage}
                      />
                    )}
                  </div>
                  
                  <div className={styles.petCardBack}>
                    <p>Birth Date: {new Date(pet.birthDate).toLocaleDateString()}</p>
                    <p>Weight: {pet.weight} kg</p>
    
                    {editingPet && editingPet._id === pet._id ? (
                      <form onSubmit={handleUpdatePet}>
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
                    ) : (
                      <>
                        <button onClick={() => handleEditClick(pet)}>Edit</button>
                        <button onClick={() => handleDeletePet(pet._id)}>Delete</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }
    
    export default MyPets;