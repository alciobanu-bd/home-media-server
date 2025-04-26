const { ObjectId } = require('mongodb');
const { getDb } = require('../utils/db');

/**
 * Route handler for getting metadata for a file
 * GET /api/metadata/:file_id
 */
const getMetadataHandler = async (request, reply) => {
  const { file_id } = request.params;
  const db = getDb();
  
  try {
    const metadata = await db.collection('metadata')
      .findOne({ file_id: new ObjectId(file_id) });
    
    if (!metadata) {
      return reply.code(404).send({ error: 'Metadata not found' });
    }
    
    return metadata;
  } catch (err) {
    return reply.code(500).send({ error: 'Failed to retrieve metadata' });
  }
};

module.exports = function(fastify, opts, done) {
  fastify.get('/metadata/:file_id', getMetadataHandler);
  done();
}; 