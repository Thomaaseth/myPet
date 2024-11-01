const request = require('supertest');
const app = require('../../app');
const Pet = require('../../src/models/Pet.model');
const Vet = require('../../src/models/Vet.model');
const VetVisit = require('../../src/models/VetVisit.model');
const { createPetTestUser, createTestPet, createTestVet, createTestVetVisit } = require('../helpers');

describe('Vet Routes', () => {
    let user, token, pet;

    beforeEach(async () => {
        const testData = await createPetTestUser();
        user = testData.user;
        token = testData.token;
        pet = await createTestPet(user);
    });

    describe('GET /api/pets/:petId/vets', () => {
        it('should get all vets for a pet', async () => {
            const vet1 = await createTestVet(user, pet);
            const vet2 = await createTestVet(user, pet, { clinicName: 'Second Clinic' });

            const response = await request(app)
                .get(`/api/pets/${pet._id}/vets`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveLength(2);
        });

        it('should return empty array when pet has no vets', async () => {
            const response = await request(app)
                .get(`/api/pets/${pet._id}/vets`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveLength(0);
        });

        it('should fail without authentication', async () => {
            const response = await request(app)
                .get(`/api/pets/${pet._id}/vets`);

            expect(response.status).toBe(401);
        });

        it('should not allow access to another user\'s pet vets', async () => {
            const otherUser = await createPetTestUser();
            const otherPet = await createTestPet(otherUser.user);

            const response = await request(app)
                .get(`/api/pets/${otherPet._id}/vets`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
        });
    });

    describe('POST /api/pets/:petId/vets', () => {
        it('should create a new vet', async () => {
            const response = await request(app)
                .post(`/api/pets/${pet._id}/vets`)
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
            
            // Fix verification by using the existing pet variable
            const updatedPet = await Pet.findById(pet._id).populate('vets');
            expect(updatedPet.vets).toContainEqual(
                expect.objectContaining({ clinicName: 'New Clinic' })
            );
        });

        it('should reuse existing vet if same clinic and vet name', async () => {
            // First create a vet
            const firstPet = await createTestPet(user, { name: 'First Pet' });
            await request(app)
                .post(`/api/pets/${firstPet._id}/vets`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    clinicName: 'Reuse Clinic',
                    vetName: 'Dr. Reuse',
                    contactInfo: { phone: '123-456-7890' }
                });

            // Try to create same vet for second pet
            const secondPet = await createTestPet(user, { name: 'Second Pet' });
            const response = await request(app)
                .post(`/api/pets/${secondPet._id}/vets`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    clinicName: 'Reuse Clinic',
                    vetName: 'Dr. Reuse',
                    contactInfo: { phone: '123-456-7890' }
                });

            expect(response.status).toBe(200); // 200 instead of 201 for existing vet
            expect(response.body.message).toContain('Existing vet added');
        });

        it('should fail with missing required fields', async () => {
            const response = await request(app)
                .post(`/api/pets/${pet._id}/vets`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    clinicName: 'New Clinic'
                    // Missing required fields
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message');
        });
    });

    describe('PUT /api/pets/:petId/vets/:vetId', () => {
        let vet;

        beforeEach(async () => {
            vet = await createTestVet(user, pet);
        });

        it('should update vet successfully', async () => {
            const response = await request(app)
                .put(`/api/pets/${pet._id}/vets/${vet._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    clinicName: 'Updated Clinic',
                    vetName: 'Dr. Updated'
                });

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveProperty('clinicName', 'Updated Clinic');
            expect(response.body.data).toHaveProperty('vetName', 'Dr. Updated');
        });

        it('should not update vet for another user\'s pet', async () => {
            const otherUser = await createPetTestUser();
            const otherPet = await createTestPet(otherUser.user);

            const response = await request(app)
                .put(`/api/pets/${otherPet._id}/vets/${vet._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    clinicName: 'Updated Clinic'
                });

            expect(response.status).toBe(404);
        });
    });

    describe('DELETE /api/pets/:petId/vets/:vetId', () => {
        let vet;

        beforeEach(async () => {
            vet = await createTestVet(user, pet);
        });

        it('should remove vet from pet successfully', async () => {
            const response = await request(app)
                .delete(`/api/pets/${pet._id}/vets/${vet._id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);

            // Verify vet is removed from pet
            const updatedPet = await Pet.findById(pet._id);
            expect(updatedPet.vets).not.toContain(vet._id);
        });

        it('should delete vet completely if no more pets associated', async () => {
            const response = await request(app)
                .delete(`/api/pets/${pet._id}/vets/${vet._id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);

            // Verify vet is deleted
            const vetExists = await Vet.findById(vet._id);
            expect(vetExists).toBeNull();
        });

        it('should not remove vet from another user\'s pet', async () => {
            const otherUser = await createPetTestUser();
            const otherPet = await createTestPet(otherUser.user);

            const response = await request(app)
                .delete(`/api/pets/${otherPet._id}/vets/${vet._id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
        });
    });
});

describe('Vet Visit Routes', () => {
    let user, token, pet, vet;

    beforeEach(async () => {
        const testData = await createPetTestUser();
        user = testData.user;
        token = testData.token;
        pet = await createTestPet(user);
        vet = await createTestVet(user, pet);
    });

    describe('GET /api/pets/:petId/vets/:vetId/visits', () => {
        it('should get all visits for a pet and vet', async () => {
            await createTestVetVisit(pet, vet);
            await createTestVetVisit(pet, vet, { reason: 'Follow-up' });

            const response = await request(app)
                .get(`/api/pets/${pet._id}/vets/${vet._id}/visits`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveLength(2);
            expect(response.body.data[0]).toHaveProperty('reason', 'Follow-up');
        });

        it('should return empty array when no visits exist', async () => {
            const response = await request(app)
                .get(`/api/pets/${pet._id}/vets/${vet._id}/visits`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveLength(0);
        });

        it('should fail with invalid pet ID', async () => {
            const response = await request(app)
                .get(`/api/pets/invalid-pet-id/vets/${vet._id}/visits`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
        });

        it('should not allow access to another user\'s pet visits', async () => {
            const otherUser = await createPetTestUser();
            const otherPet = await createTestPet(otherUser.user);
            const otherVet = await createTestVet(otherUser.user, otherPet);

            const response = await request(app)
                .get(`/api/pets/${otherPet._id}/vets/${otherVet._id}/visits`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
        });
    });

    describe('POST /api/pets/:petId/vets/:vetId/visits', () => {
        it('should create a new visit', async () => {
            const visitData = {
                dateOfVisit: new Date().toISOString(),
                reason: 'Annual Checkup',
                notes: 'Everything looks good',
                prescriptions: JSON.stringify([
                    {
                        medication: 'Test Med',
                        dosage: '1 pill',
                        instructions: 'Once daily',
                        startDate: new Date().toISOString(),
                        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                    }
                ])
            };

            const response = await request(app)
                .post(`/api/pets/${pet._id}/vets/${vet._id}/visits`)
                .set('Authorization', `Bearer ${token}`)
                .send(visitData);

            expect(response.status).toBe(201);
            expect(response.body.data).toHaveProperty('reason', 'Annual Checkup');
            expect(response.body.data.prescriptions).toHaveLength(1);
        });

        it('should handle document uploads', async () => {
            const response = await request(app)
                .post(`/api/pets/${pet._id}/vets/${vet._id}/visits`)
                .set('Authorization', `Bearer ${token}`)
                .field('dateOfVisit', new Date().toISOString())
                .attach('documents', Buffer.from('fake pdf content'), {
                    filename: 'test.pdf',
                    contentType: 'application/pdf',
                });

            expect(response.status).toBe(201);
            expect(response.body.data.documents).toHaveLength(1);
        });

        it('should fail with missing required fields', async () => {
            const response = await request(app)
                .post(`/api/pets/${pet._id}/vets/${vet._id}/visits`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    // Missing dateOfVisit and reason
                    notes: 'Test notes'
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message');
        });

        it('should fail with future date', async () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 1);

            const response = await request(app)
                .post(`/api/pets/${pet._id}/vets/${vet._id}/visits`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    dateOfVisit: futureDate.toISOString(),
                    reason: 'Future Visit'
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('Visit date cannot be in the future');
        });
    });

    describe('PUT /api/pets/:petId/vets/:vetId/visits/:visitId', () => {
        let visit;

        beforeEach(async () => {
            visit = await createTestVetVisit(pet, vet);
        });

        it('should update visit successfully', async () => {
            const response = await request(app)
                .put(`/api/pets/${pet._id}/vets/${vet._id}/visits/${visit._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    reason: 'Updated Reason',
                    notes: 'Updated notes'
                });

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveProperty('reason', 'Updated Reason');
            expect(response.body.data).toHaveProperty('notes', 'Updated notes');
        });

        it('should add new documents while keeping existing ones', async () => {
            // First update with initial document
            await request(app)
                .put(`/api/pets/${pet._id}/vets/${vet._id}/visits/${visit._id}`)
                .set('Authorization', `Bearer ${token}`)
                .field('dateOfVisit', visit.dateOfVisit.toISOString())
                .attach('documents', Buffer.from('first document'), {
                    filename: 'first.pdf',
                    contentType: 'application/pdf'
                });

                
        
            // Then add another document
            const response = await request(app)
                .put(`/api/pets/${pet._id}/vets/${vet._id}/visits/${visit._id}`)
                .set('Authorization', `Bearer ${token}`)
                .field('dateOfVisit', visit.dateOfVisit.toISOString())
                .attach('documents', Buffer.from('second document'), {
                    filename: 'second.pdf',
                    contentType: 'application/pdf'
                });
            expect(response.status).toBe(200);
            expect(response.body.data.documents).toHaveLength(2);
        });

        it('should update prescriptions', async () => {
            const response = await request(app)
                .put(`/api/pets/${pet._id}/vets/${vet._id}/visits/${visit._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    prescriptions: JSON.stringify([
                        {
                            medication: 'Updated Med',
                            dosage: '2 pills',
                            instructions: 'Twice daily'
                        }
                    ])
                });

            expect(response.status).toBe(200);
            expect(response.body.data.prescriptions[0]).toHaveProperty('medication', 'Updated Med');
        });

        it('should not update visit from another user\'s pet', async () => {
            const otherUser = await createPetTestUser();
            const otherPet = await createTestPet(otherUser.user);
            const otherVet = await createTestVet(otherUser.user, otherPet);
            const otherVisit = await createTestVetVisit(otherPet, otherVet);

            const response = await request(app)
                .put(`/api/pets/${otherPet._id}/vets/${otherVet._id}/visits/${otherVisit._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    reason: 'Should Not Update'
                });

            expect(response.status).toBe(404);
        });
    });

    describe('DELETE /api/pets/:petId/vets/:vetId/visits/:visitId', () => {
        let visit;

        beforeEach(async () => {
            visit = await createTestVetVisit(pet, vet);
        });

        it('should delete visit successfully', async () => {
            const response = await request(app)
                .delete(`/api/pets/${pet._id}/vets/${vet._id}/visits/${visit._id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);

            // Verify visit is deleted
            const visitExists = await VetVisit.findById(visit._id);
            expect(visitExists).toBeNull();

            // Verify visit is removed from pet's vetVisits array
            const updatedPet = await Pet.findById(pet._id);
            expect(updatedPet.vetVisits).not.toContain(visit._id);
        });

        it('should not delete visit from another user\'s pet', async () => {
            const otherUser = await createPetTestUser();
            const otherPet = await createTestPet(otherUser.user);
            const otherVet = await createTestVet(otherUser.user, otherPet);
            const otherVisit = await createTestVetVisit(otherPet, otherVet);

            const response = await request(app)
                .delete(`/api/pets/${otherPet._id}/vets/${otherVet._id}/visits/${otherVisit._id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);

            // Verify visit still exists
            const visitExists = await VetVisit.findById(otherVisit._id);
            expect(visitExists).toBeTruthy();
        });

        it('should handle non-existent visit', async () => {
            const response = await request(app)
                .delete(`/api/pets/${pet._id}/vets/${vet._id}/visits/nonexistentid`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
        });
    });
});