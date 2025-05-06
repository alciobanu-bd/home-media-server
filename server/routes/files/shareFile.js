const { ObjectId } = require('mongodb');
const { getDb, getCollection } = require('../utils/db');
const { verifyToken } = require('../auth/authMiddleware');

/**
 * Route handler for sharing a file with Trusted Circles
 * PUT /api/files/:id/share
 * Request body: { circleIds: string[] }
 */
const shareFileHandler = async (request, reply) => {
    // Check if user is authenticated
    if (!request.user) {
        return reply.code(401).send({ 
            error: 'Unauthorized',
            message: 'Authentication required'
        });
    }

    const userId = request.user._id;
    const fileId = request.params.id;
    const { circleIds } = request.body;
    
    // Validate fileId format
    if (!ObjectId.isValid(fileId)) {
        return reply.code(400).send({
            error: 'Invalid file ID',
            message: 'The provided file ID is not valid'
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
        const filesCollection = getCollection(db, 'files');
        const circlesCollection = getCollection(db, 'circles');
        
        // First check if the file exists and belongs to this user
        const file = await filesCollection.findOne({
            _id: new ObjectId(fileId),
            userId: userId
        });
        
        if (!file) {
            return reply.code(404).send({
                error: 'Not found',
                message: 'File not found or you do not have permission to share it'
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
                message: 'You can only share files with circles that you are a member of'
            });
        }
        
        // Update the file with the circle IDs - store as ObjectIds, not strings
        await filesCollection.updateOne(
            { _id: new ObjectId(fileId) },
            { $set: { circleIds: objectIdCircleIds } }
        );
        
        return {
            success: true,
            message: 'File shared with circles successfully',
            circleIds: circleIds
        };
    } catch (err) {
        console.error('Error sharing file with circles:', err);
        return reply.code(500).send({ 
            error: 'Server Error', 
            message: 'Failed to share file with circles' 
        });
    }
};

module.exports = function(fastify, opts, done) {
    fastify.put('/files/:id/share', { preHandler: verifyToken }, shareFileHandler);
    done();
}; 