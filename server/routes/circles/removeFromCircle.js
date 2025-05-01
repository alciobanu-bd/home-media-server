/**
 * Remove a user from a Circle
 * DELETE /api/circles/:id/members/:userId
 */

const { ObjectId } = require('mongodb');
const { getDb, getCollection } = require('../utils/db');

const removeFromCircle = async (request, reply) => {
    // Must be authenticated
    if (!request.user) {
        return reply.code(401).send({
            error: 'Unauthorized',
            message: 'You must be logged in to remove members'
        });
    }

    const { id, userId: targetUserId } = request.params;
    
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
        
        // Check if current user is an admin or self-removing
        const isAdmin = circle.adminIds.some(id => id.toString() === userId.toString());
        const isSelfRemoval = userId.toString() === targetId.toString();
        
        if (!isAdmin && !isSelfRemoval) {
            return reply.code(403).send({
                error: 'Forbidden',
                message: 'You do not have permission to remove members'
            });
        }
        
        // Prevent removal of the last admin
        if (isAdmin && circle.adminIds.some(id => id.toString() === targetId.toString())) {
            if (circle.adminIds.length === 1) {
                return reply.code(400).send({
                    error: 'Bad Request',
                    message: 'Cannot remove the last admin from the Circle'
                });
            }
        }
        
        // Remove user from members and admins
        await circlesCollection.updateOne(
            { _id: circleId },
            { 
                $pull: { 
                    memberIds: targetId,
                    adminIds: targetId 
                }
            }
        );
        
        return {
            success: true,
            message: 'User removed from Circle successfully'
        };
    } catch (error) {
        request.log.error(`Error removing user from circle: ${error.message}`);
        return reply.code(500).send({
            error: 'Internal Server Error',
            message: 'Failed to remove user'
        });
    }
};

module.exports = function(fastify, opts, done) {
    fastify.delete('/api/circles/:id/members/:userId', removeFromCircle);
    done();
}; 