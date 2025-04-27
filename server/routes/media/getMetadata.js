const { getDb, getCollection } = require('../utils/db');
const { ObjectId } = require('mongodb');
const { verifyToken } = require('../auth/authMiddleware');

/**
 * Route handler for getting file metadata
 * GET /api/metadata/:file_id
 */
const getMetadataHandler = async (request, reply) => {
  const { file_id } = request.params;
  
  // Check if user is authenticated
  if (!request.user) {
    return reply.code(401).send({ 
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }

  const userId = request.user._id;
  
  try {
    const fileId = new ObjectId(file_id);
    const db = getDb();
    
    // First, check if the file exists and belongs to the user
    const filesCollection = getCollection(db, 'files');
    const file = await filesCollection.findOne({ _id: fileId });
    
    if (!file) {
      return reply.code(404).send({ error: 'File not found' });
    }
    
    // Check if the file belongs to the authenticated user
    if (!file.userId || file.userId.toString() !== userId.toString()) {
      return reply.code(403).send({ 
        error: 'Forbidden',
        message: 'You do not have permission to access this metadata'
      });
    }
    
    // Get metadata
    const metadataCollection = getCollection(db, 'metadata');
    const metadata = await metadataCollection.findOne({ file_id: fileId });
    
    if (!metadata) {
      return reply.code(404).send({ error: 'Metadata not found' });
    }
    
    return metadata;
  } catch (err) {
    console.error('Error getting metadata:', err);
    if (err.name === 'BSONError' || err.name === 'BSONTypeError') {
      return reply.code(400).send({ error: 'Invalid file ID format' });
    }
    return reply.code(500).send({ error: 'Failed to get metadata' });
  }
};

module.exports = function(fastify, opts, done) {
  fastify.get('/metadata/:file_id', { preHandler: verifyToken }, getMetadataHandler);
  done();
}; 