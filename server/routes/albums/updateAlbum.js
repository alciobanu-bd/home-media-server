const { ObjectId } = require('mongodb');
const { getDb, getCollection } = require('../utils/db');
const { verifyToken } = require('../auth/authMiddleware');

/**
 * Route handler for updating an album
 * PUT /api/albums/:id
 * Request body: { name: string }
 */
const updateAlbumHandler = async (request, reply) => {
    // Check if user is authenticated
    if (!request.user) {
        return reply.code(401).send({ 
            error: 'Unauthorized',
            message: 'Authentication required'
        });
    }

    const userId = request.user._id;
    const albumId = request.params.id;
    const { name } = request.body;
    
    // Validate albumId format
    if (!ObjectId.isValid(albumId)) {
        return reply.code(400).send({
            error: 'Invalid album ID',
            message: 'The provided album ID is not valid'
        });
    }
    
    // Validate album name
    if (!name || typeof name !== 'string' || name.trim() === '') {
        return reply.code(400).send({
            error: 'Bad Request',
            message: 'Album name is required'
        });
    }

    try {
        const db = getDb();
        const albumsCollection = getCollection(db, 'albums');
        
        // Find and update the album
        const result = await albumsCollection.findOneAndUpdate(
            {
                _id: new ObjectId(albumId),
                userId: userId
            },
            {
                $set: {
                    name: name.trim(),
                    updatedAt: new Date()
                }
            },
            {
                returnDocument: 'after'
            }
        );
        
        // Check if document was found and updated
        // In MongoDB Node.js driver 6.0.0+, the result could be directly the document
        // In older versions, the document would be in result.value
        const updatedAlbum = result?.value || result;
        
        if (!updatedAlbum) {
            return reply.code(404).send({
                error: 'Not found',
                message: 'Album not found or you do not have permission to update it'
            });
        }
        
        // Return the updated album
        return updatedAlbum;
    } catch (err) {
        console.error('Error updating album:', err);
        return reply.code(500).send({ error: 'Failed to update album' });
    }
};

module.exports = function(fastify, opts, done) {
    fastify.put('/albums/:id', { preHandler: verifyToken }, updateAlbumHandler);
    done();
}; 