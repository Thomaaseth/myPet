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