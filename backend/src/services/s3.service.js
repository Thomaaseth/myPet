const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { v4: uuidv4 } = require('uuid');

class S3Service {
  constructor() {
    this.client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
    this.bucket = process.env.AWS_BUCKET_NAME;
  }

  /**
   * Generates a unique S3 key for a document
   */
  generateS3Key(petId, originalFilename) {
    const timestamp = Date.now();
    const uuid = uuidv4();
    const sanitizedFilename = originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `pets/${petId}/documents/${timestamp}-${uuid}-${sanitizedFilename}`;
  }

  /**
   * Gets a presigned URL for uploading
   */
  async getUploadUrl(petId, filename, fileType, fileSize) {
    try {
      const s3Key = this.generateS3Key(petId, filename);
      
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: s3Key,
        ContentType: fileType
      });

      const uploadUrl = await getSignedUrl(this.client, command, {
        expiresIn: 600 // URL expires in 10 minutes
      });
      
      return {
        uploadUrl,
        s3Key
      };
    } catch (error) {
      console.error('Error generating upload URL:', error);
      throw error;
    }
  }

  /**
   * Gets a presigned URL for viewing/downloading
   */
  async getViewUrl(s3Key) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: s3Key
      });

      return await getSignedUrl(this.client, command, {
        expiresIn: 3600 // URL expires in 1 hour
      });
    } catch (error) {
      console.error('Error generating view URL:', error);
      throw error;
    }
  }

  /**
   * Deletes a document from S3
   */
  async deleteFile(s3Key) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: s3Key
      });

      await this.client.send(command);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Checks if a file exists in S3
   */
  async fileExists(s3Key) {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: s3Key
      });

      await this.client.send(command);
      return true;
    } catch (error) {
      if (error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw error;
    }
  }
}

module.exports = new S3Service();