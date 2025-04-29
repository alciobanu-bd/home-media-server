const { getDb, getCollection } = require('../utils/db');
const { verifyToken } = require('../auth/authMiddleware');
const { ObjectId } = require('mongodb');

/**
 * Route handler for creating a new album
 * POST /api/albums
 * Request body: { name: string }
 */
const createAlbumHandler = async (request, reply) => {
    // Check if user is authenticated
    if (!request.user) {
        return reply.code(401).send({ 
            error: 'Unauthorized',
            message: 'Authentication required'
        });
    }
    
    const userId = request.user._id;
    const { name } = request.body;
    
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
        
        // Create a new album
        const newAlbum = {
            name: name.trim(),
            userId,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        // Insert the album into the database
        const result = await albumsCollection.insertOne(newAlbum);
        
        // Return the created album with its ID
        return {
            ...newAlbum,
            _id: result.insertedId
        };
    } catch (err) {
        console.error('Error creating album:', err);
        return reply.code(500).send({ error: 'Failed to create album' });
    }
};

module.exports = function(fastify, opts, done) {
    fastify.post('/albums', { preHandler: verifyToken }, createAlbumHandler);
    done();
}; 