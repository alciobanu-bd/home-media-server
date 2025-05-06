const { ObjectId } = require('mongodb');
const { getDb, getCollection } = require('../utils/db');
const { verifyToken } = require('../auth/authMiddleware');

/**
 * Route handler for sharing an album with Trusted Circles
 * PUT /api/albums/:id/share
 * Request body: { circleIds: string[] }
 */
const shareAlbumHandler = async (request, reply) => {
    // Check if user is authenticated
    if (!request.user) {
        return reply.code(401).send({ 
            error: 'Unauthorized',
            message: 'Authentication required'
        });
    }

    const userId = request.user._id;
    const albumId = request.params.id;
    const { circleIds } = request.body;
    
    // Validate albumId format
    if (!ObjectId.isValid(albumId)) {
        return reply.code(400).send({
            error: 'Invalid album ID',
            message: 'The provided album ID is not valid'
        });
    }
    
    // Validate circleIds
    if (!Array.isArray(circleIds)) {
        return reply.code(400).send({
            error: 'Bad Request',
            message: 'circleIds must be an array'
        });
    }
    
    // Validate all circleIds are valid ObjectIds
    const invalidIds = circleIds.filter(id => !ObjectId.isValid(id));
    if (invalidIds.length > 0) {
        return reply.code(400).send({
            error: 'Bad Request',
            message: 'One or more circle IDs are invalid'
        });
    }

    try {
        const db = getDb();
        const albumsCollection = getCollection(db, 'albums');
        const circlesCollection = getCollection(db, 'circles');
        
        // First check if the album exists and belongs to this user
        const album = await albumsCollection.findOne({
            _id: new ObjectId(albumId),
            userId: userId
        });
        
        if (!album) {
            return reply.code(404).send({
                error: 'Not found',
                message: 'Album not found or you do not have permission to share it'
            });
        }
        
        // Verify that the user is a member of all the circles
        const objectIdCircleIds = circleIds.map(id => new ObjectId(String(id)));
        const userCircles = await circlesCollection.find({
            _id: { $in: objectIdCircleIds },
            memberIds: new ObjectId(String(userId))
        }).toArray();
        
        if (userCircles.length !== objectIdCircleIds.length) {
            return reply.code(403).send({
                error: 'Forbidden',
                message: 'You can only share albums with circles that you are a member of'
            });
        }
        
        // Update the album with the circle IDs - store as ObjectIds, not strings
        await albumsCollection.updateOne(
            { _id: new ObjectId(albumId) },
            { $set: { circleIds: objectIdCircleIds } }
        );
        
        return {
            success: true,
            message: 'Album shared with circles successfully',
            circleIds: circleIds
        };
    } catch (err) {
        console.error('Error sharing album with circles:', err);
        return reply.code(500).send({ 
            error: 'Server Error', 
            message: 'Failed to share album with circles' 
        });
    }
};

module.exports = function(fastify, opts, done) {
    fastify.put('/albums/:id/share', { preHandler: verifyToken }, shareAlbumHandler);
    done();
}; 