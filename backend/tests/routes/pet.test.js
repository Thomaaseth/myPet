const request = require('supertest');
const app = require('../../app');
const { createPetTestUser, createTestPet } = require('../helpers');

describe('Pet Routes', () => {
  let user, token;

  beforeEach(async () => {
    const testData = await createPetTestUser();
    user = testData.user;
    token = testData.token;
  });

  describe('GET /api/pets', () => {
    it('should get all pets for authenticated user', async () => {
      await createTestPet(user);
      await createTestPet(user, { name: 'Pet2' });

      const response = await request(app)
        .get('/api/pets')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
    });

    it('should return empty array when user has no pets', async () => {
      const response = await request(app)
        .get('/api/pets')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/pets');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/pets/:id', () => {
    it('should get a specific pet by id', async () => {
      const pet = await createTestPet(user);

      const response = await request(app)
        .get(`/api/pets/${pet._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('name', pet.name);
      expect(response.body.data).toHaveProperty('species', pet.species);
    });

    it('should return 404 for non-existent pet', async () => {
      const response = await request(app)
        .get('/api/pets/654321654321654321654321')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it('should not allow access to another user\'s pet', async () => {
      const otherUser = await createPetTestUser();
      const pet = await createTestPet(otherUser.user);

      const response = await request(app)
        .get(`/api/pets/${pet._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/pets', () => {
    it('should create a new pet', async () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 3);

      const response = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Max',
          species: 'dog',
          birthDate: birthDate.toISOString().split('T')[0],
          weight: 25
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('name', 'Max');
      expect(response.body.data).toHaveProperty('age');
      expect(typeof response.body.data.age).toBe('number');
    });

    it('should fail with invalid species', async () => {
      const response = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Max',
          species: 'dinosaur',
          birthDate: '2020-01-01',
          weight: 25
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should fail with invalid data', async () => {
      const response = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Max',
          // Missing required fields
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should fail with future birth date', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const response = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Max',
          species: 'dog',
          birthDate: futureDate.toISOString().split('T')[0],
          weight: 25
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('future');
    });
  });

  describe('PUT /api/pets/:id', () => {
    it('should update pet successfully', async () => {
      const pet = await createTestPet(user);

      const response = await request(app)
        .put(`/api/pets/${pet._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Name',
          weight: 30
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('name', 'Updated Name');
      expect(response.body.data).toHaveProperty('weight', 30);
    });

    it('should not update another user\'s pet', async () => {
      const otherUser = await createPetTestUser();
      const pet = await createTestPet(otherUser.user);

      const response = await request(app)
        .put(`/api/pets/${pet._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Name'
        });

      expect(response.status).toBe(404);
    });

    it('should fail with invalid weight', async () => {
      const pet = await createTestPet(user);

      const response = await request(app)
        .put(`/api/pets/${pet._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          weight: -5
        });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/pets/:id', () => {
    it('should delete pet successfully', async () => {
      const pet = await createTestPet(user);

      const response = await request(app)
        .delete(`/api/pets/${pet._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('successfully');

      // Verify pet is deleted
      const getResponse = await request(app)
        .get(`/api/pets/${pet._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(getResponse.status).toBe(404);
    });

    it('should not delete another user\'s pet', async () => {
      const otherUser = await createPetTestUser();
      const pet = await createTestPet(otherUser.user);

      const response = await request(app)
        .delete(`/api/pets/${pet._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it('should return 404 for non-existent pet', async () => {
      const response = await request(app)
        .delete('/api/pets/654321654321654321654321')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });
});

describe('Food Tracking Routes', () => {
  let user, token, pet;

  beforeEach(async () => {
    const testData = await createPetTestUser();
    user = testData.user;
    token = testData.token;
    pet = await createTestPet(user);
  });

  const createTestFoodTracking = async (petId) => {
    return await request(app)
      .post(`/api/pets/${petId}/food-tracking`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'dry',
        totalWeight: 1000,
        dailyAmount: 100
      });
  };

  describe('GET /api/pets/:id/food-tracking', () => {
    it('should get food tracking data for a pet', async () => {
      await createTestFoodTracking(pet._id);

      const response = await request(app)
        .get(`/api/pets/${pet._id}/food-tracking`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('type', 'dry');
      expect(response.body.data).toHaveProperty('totalWeight', 1000);
      expect(response.body.data).toHaveProperty('dailyAmount', 100);
    });

    it('should return null when no food tracking exists', async () => {
      const response = await request(app)
        .get(`/api/pets/${pet._id}/food-tracking`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeNull();
    });

    it('should not allow access to another user\'s pet food tracking', async () => {
      const otherUser = await createPetTestUser();
      const otherPet = await createTestPet(otherUser.user);

      const response = await request(app)
        .get(`/api/pets/${otherPet._id}/food-tracking`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/pets/:id/food-tracking', () => {
    it('should create new food tracking data', async () => {
      const response = await createTestFoodTracking(pet._id);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('type', 'dry');
      expect(response.body.data).toHaveProperty('totalWeight', 1000);
      expect(response.body.data).toHaveProperty('dailyAmount', 100);
    });

    it('should update existing food tracking data', async () => {
      await createTestFoodTracking(pet._id);

      const response = await request(app)
        .post(`/api/pets/${pet._id}/food-tracking`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'moist',
          totalWeight: 2000,
          dailyAmount: 200
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('type', 'moist');
      expect(response.body.data).toHaveProperty('totalWeight', 2000);
      expect(response.body.data).toHaveProperty('dailyAmount', 200);
    });

    it('should not allow negative values', async () => {
      const response = await request(app)
        .post(`/api/pets/${pet._id}/food-tracking`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'dry',
          totalWeight: -1000,
          dailyAmount: 100
        });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/pets/:id/food-tracking', () => {
    it('should delete food tracking data', async () => {
      await createTestFoodTracking(pet._id);

      const response = await request(app)
        .delete(`/api/pets/${pet._id}/food-tracking`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);

      // Verify deletion
      const getResponse = await request(app)
        .get(`/api/pets/${pet._id}/food-tracking`)
        .set('Authorization', `Bearer ${token}`);

      expect(getResponse.body.data).toBeNull();
    });

    it('should return success even if no food tracking exists', async () => {
      const response = await request(app)
        .delete(`/api/pets/${pet._id}/food-tracking`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
    });
  });
});

describe('Food Tracking Calculations', () => {
  let user, token, pet;

  beforeEach(async () => {
    const testData = await createPetTestUser();
    user = testData.user;
    token = testData.token;
    pet = await createTestPet(user);
  });

  const createFoodTrackingWithValues = async (petId, totalWeight, dailyAmount) => {
    return await request(app)
      .post(`/api/pets/${petId}/food-tracking`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'dry',
        totalWeight,
        dailyAmount
      });
  };

  describe('Days remaining calculation', () => {
    it('should calculate 10 days remaining for 1000g total and 100g daily', async () => {
      const response = await createFoodTrackingWithValues(pet._id, 1000, 100);
      
      expect(response.status).toBe(200);
      expect(response.body.data.remainingDays).toBe(10);
    });

    it('should round down to nearest day for non-whole numbers', async () => {
      const response = await createFoodTrackingWithValues(pet._id, 950, 100);
      
      expect(response.status).toBe(200);
      expect(response.body.data.remainingDays).toBe(9);
    });

    it('should handle large numbers correctly', async () => {
      const response = await createFoodTrackingWithValues(pet._id, 10000, 250);
      
      expect(response.status).toBe(200);
      expect(response.body.data.remainingDays).toBe(40);
    });
  });

  describe('Depletion date calculation', () => {
    it('should calculate correct depletion date', async () => {
      const response = await createFoodTrackingWithValues(pet._id, 1000, 100);
      
      const today = new Date();
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() + 10);
      
      expect(response.status).toBe(200);
      expect(new Date(response.body.data.depletionDate)).toEqual(expectedDate);
    });

    it('should handle month/year transitions correctly', async () => {
      const response = await createFoodTrackingWithValues(pet._id, 3100, 100);
      
      const today = new Date();
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() + 31);
      
      expect(response.status).toBe(200);
      expect(new Date(response.body.data.depletionDate)).toEqual(expectedDate);
    });
  });
});