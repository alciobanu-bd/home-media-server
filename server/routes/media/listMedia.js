const { ObjectId } = require('mongodb');
const { getDb, getCollection } = require('../utils/db');

/**
 * Route handler for getting paginated media list
 * GET /api/media
 */
const listMediaHandler = async (request, reply) => {
  console.log('API request params:', request.query);
  const { lastId, limit = 20, id } = request.query;
  const db = getDb();
  
  // If an ID is provided, fetch a single item and its neighbors
  if (id) {
    try {
      console.log('Fetching media with ID:', id);
      const objectId = new ObjectId(id);
      
      // Get all items for navigation
      const filesCollection = getCollection(db, 'files');
      const allFiles = await filesCollection
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      
      console.log(`Found ${allFiles.length} files for navigation`);
      
      // Check if the requested item exists
      const requestedItem = allFiles.find(file => file._id.toString() === id);
      if (!requestedItem) {
        console.log('Requested item not found');
        return reply.code(404).send({ error: 'Item not found' });
      }

      // Get metadata for all files
      const metadataCollection = getCollection(db, 'metadata');
      const filesWithMetadata = await Promise.all(allFiles.map(async (file) => {
        const metadata = await metadataCollection
          .findOne({ file_id: file._id });
        return { ...file, metadata };
      }));
      
      return filesWithMetadata;
    } catch (err) {
      console.error('Error fetching by ID:', err.message);
      return reply.code(400).send({ error: 'Invalid ID format' });
    }
  }
  
  // Normal pagination logic
  let query = {};
  if (lastId) {
    query._id = { $lt: new ObjectId(lastId) };
  }
  
  const filesCollection = getCollection(db, 'files');
  const files = await filesCollection
    .find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit, 10))
    .toArray();

  // Get metadata for paginated files
  const metadataCollection = getCollection(db, 'metadata');
  const filesWithMetadata = await Promise.all(files.map(async (file) => {
    const metadata = await metadataCollection
      .findOne({ file_id: file._id });
    return { ...file, metadata };
  }));
  
  return filesWithMetadata;
};

module.exports = function(fastify, opts, done) {
  fastify.get('/media', listMediaHandler);
  done();
}; 