const request = require('supertest');
const app = require('../../app');
const { createPetTestUser, createTestPet, createTestVet, createTestVetVisit } = require('../helpers');

describe('Vet Routes', () => {
    let user, token, pet;

    beforeEach(async () => {
        const testData = await createPetTestUser();
        user = testData.user;
        token = testData.token;
        pet = await createTestPet(user);
    });

    describe('GET /api/vets', () => {
        it('should get all vets for authenticated user', async () => {
            await createTestVet(user);
            await createTestVet(user, { clinicName: 'Second Clinic' });

            const response = await request(app)
                .get('/api/vets')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveLength(2);
        });

        it('should return empty array when user has no vets', async () => {
            const response = await request(app)
                .get('/api/vets')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveLength(0);
        });

        it('should fail without authentication', async () => {
            const response = await request(app)
                .get('/api/vets');

            expect(response.status).toBe(401);
        });
    });

    describe('POST /api/vets', () => {
        it('should create a new vet', async () => {
            const response = await request(app)
                .post('/api/vets')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    clinicName: 'New Clinic',
                    vetName: 'Dr. New',
                    address: {
                        street: '123 New St',
                        city: 'New City',
                        state: 'NS',
                        zipCode: '12345',
                        country: 'Test Country'
                    },
                    contactInfo: {
                        email: 'new@vet.com',
                        phone: '123-456-7890'
                    }
                });

            expect(response.status).toBe(201);
            expect(response.body.data).toHaveProperty('clinicName', 'New Clinic');
            expect(response.body.data).toHaveProperty('vetName', 'Dr. New');
        });

        it('should fail with missing required fields', async () => {
            const response = await request(app)
                .post('/api/vets')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    clinicName: 'New Clinic'
                    // Missing required fields
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message');
        });

        it('should fail with invalid email format', async () => {
            const response = await request(app)
                .post('/api/vets')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    clinicName: 'New Clinic',
                    vetName: 'Dr. New',
                    contactInfo: {
                        email: 'invalid-email',
                        phone: '123-456-7890'
                    }
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('valid email');
        });
    });

    describe('PUT /api/vets/:id', () => {
        it('should update vet successfully', async () => {
            const vet = await createTestVet(user);

            const response = await request(app)
                .put(`/api/vets/${vet._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    clinicName: 'Updated Clinic',
                    vetName: 'Dr. Updated'
                });

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveProperty('clinicName', 'Updated Clinic');
            expect(response.body.data).toHaveProperty('vetName', 'Dr. Updated');
        });

        it('should not update another user\'s vet', async () => {
            const otherUser = await createPetTestUser();
            const vet = await createTestVet(otherUser.user);

            const response = await request(app)
                .put(`/api/vets/${vet._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    clinicName: 'Updated Clinic'
                });

            expect(response.status).toBe(404);
        });
    });

    describe('DELETE /api/vets/:id', () => {
        it('should delete vet successfully', async () => {
            const vet = await createTestVet(user);

            const response = await request(app)
                .delete(`/api/vets/${vet._id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toContain('successfully');

            // Verify vet is deleted
            const getResponse = await request(app)
                .get('/api/vets')
                .set('Authorization', `Bearer ${token}`);
            expect(getResponse.body.data).not.toContainEqual(
                expect.objectContaining({ _id: vet._id.toString() })
            );
        });

        it('should not delete another user\'s vet', async () => {
            const otherUser = await createPetTestUser();
            const vet = await createTestVet(otherUser.user);

            const response = await request(app)
                .delete(`/api/vets/${vet._id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
        });
    });

    describe('VET VISITS', () => {
        let vet;

        beforeEach(async () => {
            vet = await createTestVet(user);
        });

        describe('GET /api/vets/:petId/visits', () => {
            it('should get all visits for a pet', async () => {
                await createTestVetVisit(pet, vet);
                await createTestVetVisit(pet, vet, { reason: 'Follow-up' });

                const response = await request(app)
                    .get(`/api/vets/${pet._id}/visits`)
                    .set('Authorization', `Bearer ${token}`);

                expect(response.status).toBe(200);
                expect(response.body.data).toHaveLength(2);
            });
        });

        describe('POST /api/vets/:vetId/visits/:petId', () => {
            it('should create a new visit', async () => {
                const response = await request(app)
                    .post(`/api/vets/${vet._id}/visits/${pet._id}`)
                    .set('Authorization', `Bearer ${token}`)
                    .send({
                        dateOfVisit: new Date().toISOString(),
                        reason: 'Checkup',
                        notes: 'Test notes'
                    });

                expect(response.status).toBe(201);
                expect(response.body.data).toHaveProperty('reason', 'Checkup');
            });
        });

        // Add more tests later
    });
});