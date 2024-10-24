const request = require('supertest');
const app = require('../../app');
const User = require('../../src/models/User.model');
const { createTestUser } = require('../helpers');

describe('Auth Routes', () => {
  describe('POST /api/auth/signup', () => {
    it('should create a new user and return token', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'new@test.com',
          password: 'Password123',
          firstName: 'New',
          lastName: 'User'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('authToken');
      expect(response.body.user).toHaveProperty('email', 'new@test.com');
    });

    it('should return error for existing email', async () => {
      await createTestUser();
      
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@test.com',
          password: 'Password123',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'User already exists.');
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'invalid-email',
          password: 'Password123',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Please provide a valid email address.');
    });

    it('should validate password requirements', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'valid@test.com',
          password: 'weak',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Password must have at least 8 characters');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await createTestUser();
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'Password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('authToken');
    });

    it('should fail with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'WrongPassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'INCORRECT_PASSWORD');
    });

    it('should fail with non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'Password123'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'USER_NOT_FOUND');
    });
  });

  describe('GET /api/auth/verify', () => {
    let token;

    beforeEach(async () => {
      const testData = await createTestUser();
      token = testData.token;
    });

    it('should verify valid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('email', 'test@test.com');
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });

    it('should fail with missing token', async () => {
        const response = await request(app)
            .get('/api/auth/verify');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message');
    });
  });

  describe('PUT /api/auth/update-email', () => {
    let token, user;

    beforeEach(async () => {
      const testData = await createTestUser();
      token = testData.token;
      user = testData.user;
    });

    it('should update email successfully', async () => {
      const response = await request(app)
        .put('/api/auth/update-email')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'updated@test.com' });

      expect(response.status).toBe(200);
      expect(response.body.user).toHaveProperty('email', 'updated@test.com');
    });

    it('should prevent duplicate email update', async () => {
      // Create another user first
      await User.create({
        email: 'existing@test.com',
        password: 'hashedPassword',
        firstName: 'Another',
        lastName: 'User'
      });

      const response = await request(app)
        .put('/api/auth/update-email')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'existing@test.com' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Email is already in use');
    });
  });

  describe('PUT /api/auth/change-password', () => {
    let token;

    beforeEach(async () => {
      const testData = await createTestUser();
      token = testData.token;
    });

    it('should change password successfully', async () => {
      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'Password123',
          newPassword: 'NewPassword123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Password updated successfully');

      // Verify login with new password works
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'NewPassword123'
        });

      expect(loginResponse.status).toBe(200);
    });

    it('should fail with incorrect current password', async () => {
      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'WrongPassword',
          newPassword: 'NewPassword123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Current password is incorrect');
    });
  });

  describe('DELETE /api/auth/delete-account', () => {
    let token, userId;

    beforeEach(async () => {
      const testData = await createTestUser();
      token = testData.token;
      userId = testData.user._id;
    });

    it('should delete account successfully', async () => {
      const response = await request(app)
        .delete('/api/auth/delete-account')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Account deleted successfully');

      // Verify user is actually deleted
      const deletedUser = await User.findById(userId);
      expect(deletedUser).toBeNull();
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .delete('/api/auth/delete-account');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    it('should fail with invalid token', async () => {
        const response = await request(app)
            .delete('/api/auth/delete-account')
            .set('Authorization', 'Bearer invalid-token');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message');
    });
  });
});