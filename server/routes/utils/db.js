const { MongoClient } = require('mongodb');

// MongoDB connection
let db;
const mongoUrl = process.env.MONGO_URL;
const dbName = 'login';

// Validate required environment variables
const validateRequiredEnvVars = () => {
  const requiredVars = [
    'COLLECTION_FILES',
    'COLLECTION_THUMBNAILS',
    'COLLECTION_METADATA',
    'COLLECTION_USERS'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}.`);
  }
};

const COLLECTIONS = {
  files: process.env.COLLECTION_FILES,
  thumbnails: process.env.COLLECTION_THUMBNAILS,
  metadata: process.env.COLLECTION_METADATA,
  users: process.env.COLLECTION_USERS
};

// Get a collection from the database
const getCollection = (db, collectionName) => {
  if (!db) {
    throw new Error('Database instance is required');
  }
  if (!collectionName) {
    throw new Error('Collection name is required');
  }
  if (!COLLECTIONS[collectionName]) {
    throw new Error(`Collection not defined: ${collectionName}`);
  }
  return db.collection(COLLECTIONS[collectionName]);
};

// Connect to MongoDB
const connectToMongo = async () => {
  try {
    // Validate environment variables before connecting
    validateRequiredEnvVars();
    
    console.log('Attempting to connect to MongoDB at:', mongoUrl);
    const client = new MongoClient(mongoUrl);
    await client.connect();
    console.log('Connected to MongoDB successfully');
    db = client.db(dbName);
    
    // Create indexes for better performance using getCollection
    const filesCollection = getCollection(db, 'files');
    const thumbnailsCollection = getCollection(db, 'thumbnails');
    const metadataCollection = getCollection(db, 'metadata');
    const usersCollection = getCollection(db, 'users');
    
    await filesCollection.createIndex({ createdAt: -1 });
    await filesCollection.createIndex({ userId: 1 });
    await filesCollection.createIndex({ md5Hash: 1 });
    await filesCollection.createIndex({ userId: 1, md5Hash: 1 });
    await thumbnailsCollection.createIndex({ file_id: 1 });
    await thumbnailsCollection.createIndex({ userId: 1 });
    await metadataCollection.createIndex({ file_id: 1 });
    await metadataCollection.createIndex({ userId: 1 });
    await usersCollection.createIndex({ googleId: 1 }, { unique: true });
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    
    return db;
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    console.log('Please make sure MongoDB is installed and running on your system.');
    process.exit(1);
  }
};

// Get the database instance
const getDb = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

module.exports = {
  connectToMongo,
  getDb,
  getCollection
}; 