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
        const response = await api.get('/api/pets');
        return response.data;
    } catch (error) {
        console.error('Error fetching products:', error.response || error);
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
        console.error('Error deleting product:', error.response || error);
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

export const getVetVisits = async (petId, vetId) => {
    try {
        const response = await api.get(`/api/pets/${petId}/vets/${vetId}/visits`);
        return response.data;
    } catch (error) {
        console.error('Error fetching vet visits:', error.response || error);
        throw error.response ? error.response.data : error;
    }
};

export const createVetVisit = async (petId, vetId, visitData) => {
    try {
        // Create FormData object to handle file uploads properly
        const formData = new FormData();
        
        // Handle files if they exist
        if (visitData.documents) {
            visitData.documents.forEach(file => {
                formData.append('documents', file);
            });
            delete visitData.documents; // Remove from main data object
        }
        
        Object.keys(visitData).forEach(key => {
            if (key === 'prescriptions' && visitData[key]) {
                formData.append(key, JSON.stringify(visitData[key]));
            } else {
                formData.append(key, visitData[key]);
            }
        });

        const response = await api.post(
            `/api/pets/${petId}/vets/${vetId}/visits`, 
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating vet visit:', error.response || error);
        throw error.response ? error.response.data : error;
    }
};

export const updateVetVisit = async (petId, vetId, visitId, visitData) => {
    try {
        const formData = new FormData();
        
        // Handle files if they exist
        if (visitData.documents) {
            visitData.documents.forEach(file => {
                // Only append if it's a File object (new file)
                if (file instanceof File) {
                    formData.append('documents', file);
                }
            });
            delete visitData.documents;
        }
        
        Object.keys(visitData).forEach(key => {
            if (key === 'prescriptions' && visitData[key]) {
                formData.append(key, JSON.stringify(visitData[key]));
            } else if (visitData[key] !== null && visitData[key] !== undefined) {
                formData.append(key, visitData[key]);
            }
            // Handle empty strings explicitly
            else if (visitData[key] === '') {
            formData.append(key, ''); // Explicitly append empty string
            }
            // Handle all other non-null/undefined values
            else if (visitData[key] !== null && visitData[key] !== undefined) {
            formData.append(key, visitData[key]);
            }
        });

        const response = await api.put(
            `/api/pets/${petId}/vets/${vetId}/visits/${visitId}`, 
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating vet visit:', error.response || error);
        throw error.response ? error.response.data : error;
    }
};

export const deleteVetVisit = async (petId, vetId, visitId) => {
    try {
        const response = await api.delete(
            `/api/pets/${petId}/vets/${vetId}/visits/${visitId}`
        );
        return response.data;
    } catch (error) {
        console.error('Error deleting vet visit:', error.response || error);
        throw error.response ? error.response.data : error;
    }
};