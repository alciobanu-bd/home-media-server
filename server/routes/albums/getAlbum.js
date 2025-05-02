const { ObjectId } = require('mongodb');
const { getDb, getCollection } = require('../utils/db');
const { verifyToken } = require('../auth/authMiddleware');

/**
 * Route handler for getting a single album without its contents
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
        
        // Find the album that either belongs to the user or is shared with a circle they're in
        const userObjectId = new ObjectId(userId);
        const circlesCollection = getCollection(db, 'circles');
        
        // First get circles the user is a member of
        const userCircles = await circlesCollection.find({
            memberIds: userObjectId
        }).toArray();
        
        const userCircleIds = userCircles.map(circle => circle._id.toString());
        
        // Find the album that either belongs to the user or is shared with one of their circles
        const album = await albumsCollection.findOne({
            _id: new ObjectId(albumId),
            $or: [
                { userId: userId },
                { circleIds: { $in: userCircleIds } }
            ]
        });
        
        if (!album) {
            return reply.code(404).send({
                error: 'Not found',
                message: 'Album not found or you do not have permission to access it'
            });
        }
        
        // Get the file count for this album
        const fileCount = await filesCollection.countDocuments({
            userId: userId,
            albums: albumId
        });
        
        // Return the album with file count but without the files array
        return {
            ...album,
            fileCount
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