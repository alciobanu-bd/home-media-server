const { ObjectId } = require('mongodb');
const { getDb, getCollection } = require('../utils/db');
const { verifyToken } = require('../auth/authMiddleware');

/**
 * Route handler for getting all files in an album
 * GET /api/albums/:id/files
 */
const getAlbumFilesHandler = async (request, reply) => {
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
        const circlesCollection = getCollection(db, 'circles');
        
        // First get circles the user is a member of
        const userObjectId = new ObjectId(userId);
        const userCircles = await circlesCollection.find({
            memberIds: userObjectId
        }).toArray();
        
        const userCircleIds = userCircles.map(circle => circle._id.toString());
        
        // Find the album that either belongs to the user or is shared with a circle they're in
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
        
        // If album belongs to the user, get all files in it
        if (album.userId.toString() === userId.toString()) {
            // Get all files in this album
            const files = await filesCollection.find({
                userId: userId,
                albums: albumId
            }).sort({ createdAt: -1 }).toArray();
            
            return { files };
        } else {
            // If accessing a shared album, get files from album owner
            const files = await filesCollection.find({
                userId: album.userId,
                albums: albumId
            }).sort({ createdAt: -1 }).toArray();
            
            return { files };
        }
    } catch (err) {
        console.error('Error getting album files:', err);
        return reply.code(500).send({ error: 'Failed to get album files' });
    }
};

module.exports = function(fastify, opts, done) {
    fastify.get('/albums/:id/files', { preHandler: verifyToken }, getAlbumFilesHandler);
    done();
}; 