import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005',
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const signup = async (userData) => {
  try {
      const response = await api.post('/api/auth/signup', userData);
      console.log('Signup response: ', response);
      return response.data;
  } catch (error) {
      console.log('Signup error: ', error.response || error);
      if (error.response && error.response.data && error.response.data.message) {
          throw new Error(error.response.data.message);
      } else {
          throw new Error('An unexpected error occurred');
      }
  }
};

export const login = async (credentials) => {
  try {
      const response = await api.post('/api/auth/login', credentials);
      return response.data;
  } catch (error) {
      console.error('Login error:', error.response || error);
      if (error.response && error.response.data) {
          throw error.response.data;
      } else {
          throw { message: 'An unexpected error occurred' };
      }
  }
};

export const updateEmail = async (newEmail) => {
    try {
        const response = await api.put('/api/auth/update-email', { email: newEmail });
        console.log('Update email response:', response);
        return response.data;
    } catch (error) {
        console.error('Update email error:', error.response || error);
        if (error.response && error.response.data) {
            throw error.response.data;
        } else {
            throw { message: 'An unexpected error occurred' };
        }
    }
};

export const changePassword = async (currentPassword, newPassword) => {
    try {
        const response = await api.put('/api/auth/change-password', { currentPassword, newPassword });
        console.log('Change password response:', response);
        return response.data;
    } catch (error) {
        console.error('Change password error:', error.response || error);
        if (error.response && error.response.data) {
            throw new Error(error.response.data.message);
        } else {
            throw new Error('An unexpected error occurred');
        }
    }
};

export const deleteAccount = async () => {
    try {
        const response = await api.delete('/api/auth/delete-account');
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

// Pets CRUD operations

export const getPets = async () => {
    try {
        // First get all pets
        const petsResponse = await api.get('/api/pets');
        
        // Then get vets and their visits for each pet
        const petsWithVetsAndVisits = await Promise.all(
            petsResponse.data.data.map(async (pet) => {
                try {
                    const vetsResponse = await getVets(pet._id);
                    
                    // Get visits for each vet
                    const vetsWithVisits = await Promise.all(
                        vetsResponse.data.map(async (vet) => {
                            try {
                                // Get both past visits and next appointment
                                const [pastVisitsResponse, nextAppointmentResponse] = await Promise.all([
                                    getVetPastVisits(pet._id, vet._id),
                                    getNextAppointment(pet._id, vet._id)
                                ]);

                                // Combine them into a single visits array
                                const allVisits = [
                                    ...(pastVisitsResponse.data || []),
                                    ...(nextAppointmentResponse.data ? [nextAppointmentResponse.data] : [])
                                ];

                                return {
                                    ...vet,
                                    visits: allVisits
                                };
                            } catch (error) {
                                console.error(`Error fetching visits for vet ${vet._id}:`, error);
                                return {
                                    ...vet,
                                    visits: []
                                };
                            }
                        })
                    );
                    return {
                        ...pet,
                        vets: vetsWithVisits
                    };
                } catch (error) {
                    console.error(`Error fetching vets for pet ${pet._id}:`, error);
                    return {
                        ...pet,
                        vets: []
                    };
                }
            })
        );

        return {
            ...petsResponse.data,
            data: petsWithVetsAndVisits
        };
    } catch (error) {
        console.error('Error fetching pets:', error.response || error);
        throw error.response ? error.response.data : error;
    }
};

export const getSpeciesList = async () => {
    try {
        const response = await api.get('/api/pets/species-list');
        return response.data;
    } catch (error) {
        console.error('Error fetching species list:', error);
        throw error;
    }
};

export const createPet = async (petData) => {
    try {
        const formData = new FormData();
        for (const key in petData) {
            formData.append(key, petData[key]);
        }
        const response = await api.post('/api/pets', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        console.error('Error creating pet:', error.response || error);
        throw error.response ? error.response.data : error;
    }
};

export const updatePet = async (petId, petData) => {
    try {
        console.log('Updating pet with ID:', petId);
        console.log('Update data:', petData);
        const formData = new FormData();
        for (const key in petData) {
            formData.append(key, petData[key]);
        }
        const response = await api.put(`/api/pets/${petId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        console.log('Update response:', response);
        return response.data;
    } catch (error) {
        console.error('Error updating pet:', error.response || error);
        throw error.response ? error.response.data : error;
    }
};

export const deletePet = async (petId) => {
    try {
        const response = await api.delete(`/api/pets/${petId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting pet:', error.response || error);
        throw error.response ? error.response.data : error;
    }
};

// Pets weight operations

export const addPetWeight = async (petId, weightData) => {
    try {
        console.log('Sending weight data:', weightData);

        const response = await api.post(`/api/pets/${petId}/weights`, weightData);
        console.log('Server response:', response);

        console.log('Weight added:', response.data);
        return response.data;
    } catch (error) {
        console.log('Error adding weight:', error.response || error);
        throw error.response ? error.response.data : error;
    }
};

export const getPetWeights = async (petId) => {
    try {
        const response = await api.get(`/api/pets/${petId}/weights`);
        return response.data;
    } catch (error) {
        console.error('Error fetching weights:', error.response || error);
        throw error.response ? error.response.data : error;
    }
};

export const deletePetWeight = async (petId, weightId) => {
    try {
        const response = await api.delete(`/api/pets/${petId}/weights/${weightId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting weight entry:', error.response || error);
        throw error.response ? error.response.data : error;
    }
};

export const updatePetWeight = async (petId, weightId, weightData) => {
    try {
        const response = await api.put(
            `/api/pets/${petId}/weights/${weightId}`, 
            weightData
        );
        return response.data;
    } catch (error) {
        console.error('Error updating weight entry:', error.response || error);
        throw error.response ? error.response.data : error;
    }
};

// Vet operations

export const getVets = async (petId) => {
    try {
        const response = await api.get(`/api/pets/${petId}/vets`);
        return response.data;
    } catch (error) {
        console.error('Error fetching vets:', error.response || error);
        throw error.response ? error.response.data : error;
    }
};


export const createVet = async (petId, vetData) => {
    try {
        const response = await api.post(`/api/pets/${petId}/vets`, {
            ...vetData,
            petId
        });
        return response.data;
    } catch (error) {
        console.error('Error creating vet:', error.response || error);
        throw error.response ? error.response.data : error;
    }
};

export const updateVet = async (petId, vetId, vetData) => {
    try {
        const response = await api.put(`/api/pets/${petId}/vets/${vetId}`, vetData);
        return response.data;
    } catch (error) {
        console.error('Error updating vet:', error.response || error);
        throw error.response ? error.response.data : error;
    }
};

export const deleteVet = async (petId, vetId) => {
    try {
        const response = await api.delete(`/api/pets/${petId}/vets/${vetId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting vet:', error.response || error);
        throw error.response ? error.response.data : error;
    }
};

// Vet visit operations

// Get operations
export const getVetPastVisits = async (petId, vetId) => {
    try {
        const response = await api.get(`/api/pets/${petId}/vets/${vetId}/past-visits`);
        return response.data;
    } catch (error) {
        console.error('Error fetching past visits:', error.response || error);
        throw error.response ? error.response.data : error;
    }
};

export const getNextAppointment = async (petId, vetId) => {
    try {
        const response = await api.get(`/api/pets/${petId}/vets/${vetId}/next-appointment`);
        return response.data;
    } catch (error) {
        console.error('Error fetching next appointment:', error.response || error);
        throw error.response ? error.response.data : error;
    }
};

// Past Visits operations
export const createPastVisit = async (petId, vetId, visitData) => {
    try {
        const formData = new FormData();
        
        if (visitData.documents && visitData.documents.length > 0) {
            visitData.documents.forEach(file => {
                formData.append('documents', file);
            });
        }

        const dateOfVisit = new Date(visitData.dateOfVisit).toISOString();
        formData.append('dateOfVisit', dateOfVisit);
        formData.append('reason', visitData.reason || '');
        formData.append('notes', visitData.notes || '');

        const response = await api.post(
            `/api/pets/${petId}/vets/${vetId}/past-visits`, 
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating past visit:', error.response || error);
        throw error.response ? error.response.data : error;
    }
};

export const updatePastVisit = async (petId, vetId, visitId, visitData) => {
    try {
        const formData = new FormData();
        
        if (visitData.documents) {
            visitData.documents.forEach(file => {
                if (file instanceof File) {
                    formData.append('documents', file);
                }
            });
        }
        
        formData.append('dateOfVisit', visitData.dateOfVisit);
        formData.append('reason', visitData.reason || '');
        formData.append('notes', visitData.notes || '');

        const response = await api.put(
            `/api/pets/${petId}/vets/${vetId}/past-visits/${visitId}`, 
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating past visit:', error.response || error);
        throw error.response ? error.response.data : error;
    }
};

export const deletePastVisit = async (petId, vetId, visitId) => {
    try {
        const response = await api.delete(
            `/api/pets/${petId}/vets/${vetId}/past-visits/${visitId}`
        );
        return response.data;
    } catch (error) {
        console.error('Error deleting past visit:', error.response || error);
        throw error.response ? error.response.data : error;
    }
};

// Next Appointment operations
export const scheduleNextAppointment = async (petId, vetId, appointmentData) => {
    try {
        const dateScheduled = new Date(appointmentData.dateScheduled).toISOString();
        
        const response = await api.post(
            `/api/pets/${petId}/vets/${vetId}/next-appointment`,
            {
                dateScheduled,
                reason: appointmentData.reason || '',
                notes: appointmentData.notes || ''
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error scheduling next appointment:', error.response || error);
        throw error.response ? error.response.data : error;
    }
};

export const updateNextAppointment = async (petId, vetId, appointmentId, appointmentData) => {
    try {
        const response = await api.put(
            `/api/pets/${petId}/vets/${vetId}/next-appointment/${appointmentId}`,
            {
                dateScheduled: appointmentData.dateScheduled,
                reason: appointmentData.reason || '',
                notes: appointmentData.notes || ''
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating next appointment:', error.response || error);
        throw error.response ? error.response.data : error;
    }
};

export const deleteNextAppointment = async (petId, vetId, appointmentId) => {
    try {
        const response = await api.delete(
            `/api/pets/${petId}/vets/${vetId}/next-appointment/${appointmentId}`
        );
        return response.data;
    } catch (error) {
        console.error('Error cancelling next appointment:', error.response || error);
        throw error.response ? error.response.data : error;
    }
};