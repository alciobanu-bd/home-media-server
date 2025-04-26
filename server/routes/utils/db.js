const { MongoClient } = require('mongodb');

// MongoDB connection
let db;
const mongoUrl = process.env.MONGO_URL;
const dbName = 'login';

const COLLECTIONS = {
  files: '1-alciobanu-hms-files',
  thumbnails: '1-alciobanu-hms-thumbnails',
  metadata: '1-alciobanu-hms-metadata'
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
    console.log('Attempting to connect to MongoDB at:', mongoUrl);
    const client = new MongoClient(mongoUrl);
    await client.connect();
    console.log('Connected to MongoDB successfully');
    db = client.db(dbName);
    
    // Create indexes for better performance using getCollection
    const filesCollection = getCollection(db, 'files');
    const thumbnailsCollection = getCollection(db, 'thumbnails');
    const metadataCollection = getCollection(db, 'metadata');
    
    await filesCollection.createIndex({ createdAt: -1 });
    await thumbnailsCollection.createIndex({ file_id: 1 });
    await metadataCollection.createIndex({ file_id: 1 });
    
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