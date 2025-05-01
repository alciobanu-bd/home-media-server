/**
 * Make a user an admin of a Circle
 * POST /api/circles/:id/make-admin
 */

const { ObjectId } = require('mongodb');
const { getDb, getCollection } = require('../utils/db');

const makeAdmin = async (request, reply) => {
    // Must be authenticated
    if (!request.user) {
        return reply.code(401).send({
            error: 'Unauthorized',
            message: 'You must be logged in to manage admins'
        });
    }

    const { id } = request.params;
    const { userId: targetUserId } = request.body;
    
    if (!id || !ObjectId.isValid(id)) {
        return reply.code(400).send({
            error: 'Bad Request',
            message: 'Invalid Circle ID'
        });
    }
    
    if (!targetUserId || !ObjectId.isValid(targetUserId)) {
        return reply.code(400).send({
            error: 'Bad Request',
            message: 'Invalid User ID'
        });
    }

    try {
        const db = getDb();
        const circlesCollection = getCollection(db, 'circles');
        const userId = new ObjectId(request.user._id);
        const circleId = new ObjectId(id);
        const targetId = new ObjectId(targetUserId);
        
        // Find the circle
        const circle = await circlesCollection.findOne({ _id: circleId });
        
        if (!circle) {
            return reply.code(404).send({
                error: 'Not Found',
                message: 'Circle not found'
            });
        }
        
        // Check if user is an admin
        if (!circle.adminIds.some(id => id.toString() === userId.toString())) {
            return reply.code(403).send({
                error: 'Forbidden',
                message: 'Only Circle admins can manage other admins'
            });
        }
        
        // Check if target user is a member
        if (!circle.memberIds.some(id => id.toString() === targetId.toString())) {
            return reply.code(404).send({
                error: 'Not Found',
                message: 'User is not a member of this Circle'
            });
        }
        
        // Check if target user is already an admin
        if (circle.adminIds.some(id => id.toString() === targetId.toString())) {
            return reply.code(400).send({
                error: 'Bad Request',
                message: 'User is already an admin of this Circle'
            });
        }
        
        // Add user to admins
        await circlesCollection.updateOne(
            { _id: circleId },
            { $addToSet: { adminIds: targetId } }
        );
        
        return {
            success: true,
            message: 'User is now an admin of this Circle'
        };
    } catch (error) {
        request.log.error(`Error making user admin: ${error.message}`);
        return reply.code(500).send({
            error: 'Internal Server Error',
            message: 'Failed to update admin status'
        });
    }
};

module.exports = function(fastify, opts, done) {
    fastify.post('/api/circles/:id/make-admin', makeAdmin);
    done();
}; 