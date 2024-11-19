const request = require('supertest');
const app = require('../../app');
const { Document } = require('../../src/models/Document.model');
const { createPetTestUser, createTestPet } = require('../helpers');
const s3Service = require('../../src/services/s3.service');
const mongoose = require('mongoose');



// Mock S3 service
jest.mock('../../src/services/s3.service');

describe('Document Routes', () => {
  let user, token, pet;

  beforeEach(async () => {
    const testData = await createPetTestUser();
    user = testData.user;
    token = testData.token;
    pet = await createTestPet(user);

    // Setup S3 service mocks
    s3Service.getUploadUrl.mockResolvedValue({
      uploadUrl: 'https://fake-upload-url.com',
      s3Key: 'fake-s3-key'
    });
    s3Service.getViewUrl.mockResolvedValue('https://fake-view-url.com');
    s3Service.fileExists.mockResolvedValue(true);
    s3Service.deleteFile.mockResolvedValue();
  });

  describe('POST /pets/:petId/documents/upload-url', () => {
    it('should generate upload URL for valid request', async () => {
      const response = await request(app)
        .post(`/api/pets/${pet._id}/documents/upload-url`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          filename: 'test.pdf',
          fileType: 'application/pdf',
          fileSize: 1024
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('uploadUrl');
      expect(response.body).toHaveProperty('s3Key');
      expect(response.body).toHaveProperty('suggestedTags');
    });

    it('should fail for non-existent pet', async () => {
      const validObjectId = new mongoose.Types.ObjectId();
      const response = await request(app)
      .post(`/api/pets/${validObjectId}/documents/upload-url`)
      .set('Authorization', `Bearer ${token}`)
        .send({
          filename: 'test.pdf',
          fileType: 'application/pdf',
          fileSize: 1024
        });

      expect(response.status).toBe(404);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post(`/api/pets/${pet._id}/documents/upload-url`)
        .send({
          filename: 'test.pdf',
          fileType: 'application/pdf',
          fileSize: 1024
        });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /pets/:petId/documents', () => {
    const validDocument = {
      name: 'Test Document',
      originalName: 'test.pdf',
      s3Key: 'fake-s3-key',
      mimeType: 'application/pdf',
      size: 1024,
      tags: ['test', 'document']
    };

    it('should create document with valid data', async () => {
      const response = await request(app)
        .post(`/api/pets/${pet._id}/documents`)
        .set('Authorization', `Bearer ${token}`)
        .send(validDocument);

      expect(response.status).toBe(201);
      expect(response.body.document).toHaveProperty('name', validDocument.name);
      expect(response.body.document).toHaveProperty('url');
    });

    it('should fail if file does not exist in S3', async () => {
      s3Service.fileExists.mockResolvedValueOnce(false);

      const response = await request(app)
        .post(`/api/pets/${pet._id}/documents`)
        .set('Authorization', `Bearer ${token}`)
        .send(validDocument);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('upload incomplete');
    });

    it('should fail with missing required fields', async () => {
      const response = await request(app)
        .post(`/api/pets/${pet._id}/documents`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Document'
          // Missing other required fields
        });

      expect(response.status).toBe(500);
    });
  });

  describe('GET /pets/:petId/documents', () => {
    beforeEach(async () => {
      // Create test documents
      await Document.create([
        {
          name: 'Test Doc 1',
          originalName: 'test1.pdf',
          s3Key: 'key1',
          mimeType: 'application/pdf',
          size: 1024,
          pet: pet._id,
          tags: ['test', 'important'],
          status: 'ACTIVE'
        },
        {
          name: 'Test Doc 2',
          originalName: 'test2.pdf',
          s3Key: 'key2',
          mimeType: 'application/pdf',
          size: 1024,
          pet: pet._id,
          tags: ['test'],
          status: 'ACTIVE'
        }
      ]);
    });

    it('should get all active documents', async () => {
      const response = await request(app)
        .get(`/api/pets/${pet._id}/documents`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.documents).toHaveLength(2);
      expect(response.body.documents[0]).toHaveProperty('url');
    });

    it('should filter by search term', async () => {
      const response = await request(app)
        .get(`/api/pets/${pet._id}/documents`)
        .query({ search: 'Doc 1' })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.documents).toHaveLength(1);
    });

    it('should filter by tags', async () => {
      const response = await request(app)
        .get(`/api/pets/${pet._id}/documents`)
        .query({ tags: 'important' })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.documents).toHaveLength(1);
    });
  });

  describe('PUT /pets/:petId/documents/:documentId', () => {
    let document;

    beforeEach(async () => {
      document = await Document.create({
        name: 'Test Doc',
        originalName: 'test.pdf',
        s3Key: 'test-key',
        mimeType: 'application/pdf',
        size: 1024,
        pet: pet._id,
        tags: ['test'],
        status: 'ACTIVE'
      });
    });

    it('should update document name', async () => {
        const newName = 'Updated Doc Name';
        const response = await request(app)
          .put(`/api/pets/${pet._id}/documents/${document._id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ name: newName });
  
        expect(response.status).toBe(200);
        expect(response.body.document.name).toBe(newName);
        
        // Verify in database
        const updatedDoc = await Document.findById(document._id);
        expect(updatedDoc.name).toBe(newName);
      });
  
      it('should fail to rename document with empty name', async () => {
        const response = await request(app)
          .put(`/api/pets/${pet._id}/documents/${document._id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ name: '' });
  
        expect(response.status).toBe(400);
        expect(response.body.message).toContain('name');
      });

    it('should update document metadata', async () => {
      const response = await request(app)
        .put(`/api/pets/${pet._id}/documents/${document._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Name',
          tags: ['updated', 'test']
        });

      expect(response.status).toBe(200);
      expect(response.body.document).toHaveProperty('name', 'Updated Name');
      expect(response.body.document.tags).toContain('updated');
    });

    it('should not update document of another user\'s pet', async () => {
      const otherUser = await createPetTestUser();
      const otherPet = await createTestPet(otherUser.user);

      const response = await request(app)
        .put(`/api/pets/${otherPet._id}/documents/${document._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Should Not Update'
        });

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /pets/:petId/documents/:documentId/archive', () => {
    let document;

    beforeEach(async () => {
      document = await Document.create({
        name: 'Test Doc',
        originalName: 'test.pdf',
        s3Key: 'test-key',
        mimeType: 'application/pdf',
        size: 1024,
        pet: pet._id,
        status: 'ACTIVE'
      });
    });

    it('should archive document', async () => {
      const response = await request(app)
        .put(`/api/pets/${pet._id}/documents/${document._id}/archive`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      
      const archivedDoc = await Document.findById(document._id);
      expect(archivedDoc.status).toBe('ARCHIVED');
    });
  });

  describe('DELETE /pets/:petId/documents/:documentId', () => {
    let document;

    beforeEach(async () => {
      document = await Document.create({
        name: 'Test Doc',
        originalName: 'test.pdf',
        s3Key: 'test-key',
        mimeType: 'application/pdf',
        size: 1024,
        pet: pet._id,
        status: 'ACTIVE'
      });
    });

    it('should delete document', async () => {
      const response = await request(app)
        .delete(`/api/pets/${pet._id}/documents/${document._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(s3Service.deleteFile).toHaveBeenCalledWith('test-key');
      
      const deletedDoc = await Document.findById(document._id);
      expect(deletedDoc).toBeNull();
    });

    it('should not delete document of another user\'s pet', async () => {
      const otherUser = await createPetTestUser();
      const otherPet = await createTestPet(otherUser.user);

      const response = await request(app)
        .delete(`/api/pets/${otherPet._id}/documents/${document._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(s3Service.deleteFile).not.toHaveBeenCalled();
    });
  });
});