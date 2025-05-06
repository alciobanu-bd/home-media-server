const { ObjectId } = require('mongodb');
const { getDb, getCollection } = require('../utils/db');
const { verifyToken } = require('../auth/authMiddleware');

/**
 * Route handler for getting files shared with a specific circle
 * GET /api/circles/:id/files
 */
const getCircleSharedFilesHandler = async (request, reply) => {
    try {
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
        
        const db = getDb();
        const circlesCollection = getCollection(db, 'circles');
        const filesCollection = getCollection(db, 'files');
        
        // Verify that the user is a member of the circle
        const circle = await circlesCollection.findOne({
            _id: new ObjectId(circleId),
            memberIds: new ObjectId(userId)
        });
        
        if (!circle) {
            return reply.code(403).send({
                error: 'Forbidden',
                message: 'You are not a member of this circle'
            });
        }
        
        // Get all files shared with this circle
        const sharedFiles = await filesCollection.find({
            circleIds: new ObjectId(circleId)
        }).sort({ uploadedAt: -1 }).toArray();
        
        return {
            success: true,
            files: sharedFiles
        };
    } catch (err) {
        console.error('Error getting circle shared files:', err);
        return reply.code(500).send({ 
            error: 'Server Error', 
            message: 'Failed to get files shared with circle' 
        });
    }
};

module.exports = function(fastify, opts, done) {
    fastify.get('/circles/:id/files', { preHandler: verifyToken }, getCircleSharedFilesHandler);
    done();
}; 