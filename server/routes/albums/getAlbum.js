const { ObjectId } = require('mongodb');
const { getDb, getCollection } = require('../utils/db');
const { verifyToken } = require('../auth/authMiddleware');

/**
 * Route handler for getting a single album and its contents
 * GET /api/albums/:id
 */
const getAlbumHandler = async (request, reply) => {
    // Check if user is authenticated
    if (!request.user) {
        return reply.code(401).send({ 
            error: 'Unauthorized',
            message: 'Authentication required'
        });
    }

    const userId = request.user._id;
    const albumId = request.params.id;
    
    // Validate albumId format
    if (!ObjectId.isValid(albumId)) {
        return reply.code(400).send({
            error: 'Invalid album ID',
            message: 'The provided album ID is not valid'
        });
    }

    try {
        const db = getDb();
        const albumsCollection = getCollection(db, 'albums');
        const filesCollection = getCollection(db, 'files');
        
        // Find the album
        const album = await albumsCollection.findOne({
            _id: new ObjectId(albumId),
            userId: userId
        });
        
        if (!album) {
            return reply.code(404).send({
                error: 'Not found',
                message: 'Album not found'
            });
        }
        
        // Find all files in this album
        const files = await filesCollection
            .find({ 
                userId: userId,
                albums: albumId
            })
            .toArray();
        
        // Return the album with its files
        return {
            ...album,
            files
        };
    } catch (err) {
        console.error('Error getting album:', err);
        return reply.code(500).send({ error: 'Failed to get album' });
    }
};

module.exports = function(fastify, opts, done) {
    fastify.get('/albums/:id', { preHandler: verifyToken }, getAlbumHandler);
    done();
}; 