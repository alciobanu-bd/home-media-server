const { ObjectId } = require('mongodb');
const { getDb, getCollection } = require('../utils/db');
const { verifyToken } = require('../auth/authMiddleware');

/**
 * Route handler for getting albums shared with a specific circle
 * GET /api/circles/:id/albums
 */
const getCircleSharedAlbumsHandler = async (request, reply) => {
    // Check if user is authenticated
    if (!request.user) {
        return reply.code(401).send({ 
            error: 'Unauthorized',
            message: 'Authentication required'
        });
    }

    const userId = request.user._id;
    const circleId = request.params.id;
    
    // Validate circleId format
    if (!ObjectId.isValid(circleId)) {
        return reply.code(400).send({
            error: 'Invalid circle ID',
            message: 'The provided circle ID is not valid'
        });
    }

    try {
        const db = getDb();
        const albumsCollection = getCollection(db, 'albums');
        const circlesCollection = getCollection(db, 'circles');
        
        // First check if the user is a member of this circle
        const userObjectId = new ObjectId(userId);
        const circle = await circlesCollection.findOne({
            _id: new ObjectId(circleId),
            memberIds: userObjectId
        });
        
        if (!circle) {
            return reply.code(403).send({
                error: 'Forbidden',
                message: 'You are not a member of this circle or the circle does not exist'
            });
        }
        
        // Find all albums that have this circleId in their circleIds array
        const albums = await albumsCollection.find({
            circleIds: circleId
        }).toArray();
        
        // Add file count to each album
        const filesCollection = getCollection(db, 'files');
        
        // Process albums to include file count and owner info
        const processedAlbums = await Promise.all(albums.map(async (album) => {
            let fileCount = 0;
            
            // Count files in the album
            if (album.userId.toString() === userId.toString()) {
                // If album belongs to current user, count their files
                fileCount = await filesCollection.countDocuments({
                    userId: userId,
                    albums: album._id.toString()
                });
            } else {
                // If album belongs to another user, count their files
                fileCount = await filesCollection.countDocuments({
                    userId: album.userId,
                    albums: album._id.toString()
                });
            }
            
            // Add file count to album object
            return {
                ...album,
                fileCount
            };
        }));
        
        return {
            albums: processedAlbums
        };
    } catch (err) {
        console.error('Error getting circle shared albums:', err);
        return reply.code(500).send({ 
            error: 'Server Error', 
            message: 'Failed to get albums shared with circle' 
        });
    }
};

module.exports = function(fastify, opts, done) {
    fastify.get('/circles/:id/albums', { preHandler: verifyToken }, getCircleSharedAlbumsHandler);
    done();
}; 