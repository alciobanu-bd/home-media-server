const { MongoClient } = require('mongodb');

// MongoDB connection
let db;
const mongoUrl = process.env.MONGO_URL;
const dbName = 'login';

// Connect to MongoDB
const connectToMongo = async () => {
  try {
    console.log('Attempting to connect to MongoDB at:', mongoUrl);
    const client = new MongoClient(mongoUrl);
    await client.connect();
    console.log('Connected to MongoDB successfully');
    db = client.db(dbName);
    
    // Create indexes for better performance
    await db.collection('files').createIndex({ createdAt: -1 });
    await db.collection('thumbnails').createIndex({ file_id: 1 });
    await db.collection('metadata').createIndex({ file_id: 1 });
    
    return db;
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    console.log('Please make sure MongoDB is installed and running on your system.');
    console.log('You can install MongoDB using:');
    console.log('- macOS: brew install mongodb-community@6.0');
    console.log('- Ubuntu: sudo apt install -y mongodb');
    console.log('- Windows: Download from https://www.mongodb.com/try/download/community');
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
  getDb
}; 