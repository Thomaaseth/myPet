require('dotenv').config();
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
    // Still using in-memory database for tests to avoid affecting your real database
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Disconnect from any existing connection (your real DB)
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    // Connect to the in-memory database
    await mongoose.connect(mongoUri);
  });
  
  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  });
  
  beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });