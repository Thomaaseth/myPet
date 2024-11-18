const AWS = require('aws-sdk');

// AWS S3 configuration
const s3Config = {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    region: process.env.AWS_REGION,
    params: {
      Bucket: process.env.AWS_BUCKET_NAME
    }
  };
  
  // Initialize S3 instance
  const s3 = new AWS.S3(s3Config);
  
  // Allowed file types
  const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  // Maximum file size (5MB)
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  
  module.exports = {
    s3,
    ALLOWED_FILE_TYPES,
    MAX_FILE_SIZE
  };