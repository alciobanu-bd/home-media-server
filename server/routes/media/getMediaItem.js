const { ObjectId } = require('mongodb');
const { getDb, getCollection } = require('../utils/db');

/**
 * Route handler for getting a specific media item by ID
 * GET /api/media/item/:id
 */
const getMediaItemHandler = async (request, reply) => {
  const { id } = request.params;
  const db = getDb();
  
  try {
    console.log('Fetching specific media with ID:', id);
    const objectId = new ObjectId(id);
    
    const filesCollection = getCollection(db, 'files');
    const file = await filesCollection.findOne({ _id: objectId });
    
    if (!file) {
      return reply.code(404).send({ error: 'Media not found' });
    }
    
    return file;
  } catch (err) {
    console.error('Error fetching specific media:', err.message);
    return reply.code(400).send({ error: 'Invalid ID format' });
  }
};

module.exports = function(fastify, opts, done) {
  fastify.get('/media/item/:id', getMediaItemHandler);
  done();
}; 