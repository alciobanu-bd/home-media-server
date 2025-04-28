const { getDb, getCollection } = require('../utils/db');
const { ObjectId } = require('mongodb');
const { verifyToken } = require('../auth/authMiddleware');

/**
 * Route handler for getting a single media item with its metadata
 * GET /api/media/:id
 */
const getMediaItemHandler = async (request, reply) => {
    const { id } = request.params;
  
    // Check if user is authenticated
    if (!request.user) {
        return reply.code(401).send({ 
            error: 'Unauthorized',
            message: 'Authentication required'
        });
    }

    const userId = request.user._id;
  
    try {
        const fileId = new ObjectId(id);
        const db = getDb();
    
        // Get file information
        const filesCollection = getCollection(db, 'files');
        const file = await filesCollection.findOne({ _id: fileId });
    
        if (!file) {
            return reply.code(404).send({ error: 'File not found' });
        }
    
        // Check if the file belongs to the authenticated user
        if (!file.userId || file.userId.toString() !== userId.toString()) {
            return reply.code(403).send({ 
                error: 'Forbidden',
                message: 'You do not have permission to access this media item'
            });
        }
    
        // Get metadata
        const metadataCollection = getCollection(db, 'metadata');
        const metadata = await metadataCollection.findOne({ file_id: fileId });
    
        // Combine file info with metadata
        const mediaItem = {
            ...file,
            metadata: metadata || {}
        };
    
        return mediaItem;
    } catch (err) {
        console.error('Error getting media item:', err);
        if (err.name === 'BSONError' || err.name === 'BSONTypeError') {
            return reply.code(400).send({ error: 'Invalid ID format' });
        }
        return reply.code(500).send({ error: 'Failed to get media item' });
    }
};

module.exports = function(fastify, opts, done) {
    fastify.get('/media/:id', { preHandler: verifyToken }, getMediaItemHandler);
    done();
}; 