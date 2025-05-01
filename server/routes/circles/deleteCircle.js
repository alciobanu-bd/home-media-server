/**
 * Delete a Circle
 * DELETE /api/circles/:id
 */

const { ObjectId } = require('mongodb');
const { getDb, getCollection } = require('../utils/db');

const deleteCircle = async (request, reply) => {
    // Must be authenticated
    if (!request.user) {
        return reply.code(401).send({
            error: 'Unauthorized',
            message: 'You must be logged in to delete a Circle'
        });
    }

    const { id } = request.params;
    
    if (!id || !ObjectId.isValid(id)) {
        return reply.code(400).send({
            error: 'Bad Request',
            message: 'Invalid Circle ID'
        });
    }

    try {
        const db = getDb();
        const circlesCollection = getCollection(db, 'circles');
        const userId = new ObjectId(request.user._id);
        const circleId = new ObjectId(id);
        
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
                message: 'Only Circle admins can delete a Circle'
            });
        }
        
        // Delete the circle
        await circlesCollection.deleteOne({ _id: circleId });
        
        return {
            success: true,
            message: 'Circle deleted successfully'
        };
    } catch (error) {
        request.log.error(`Error deleting circle: ${error.message}`);
        return reply.code(500).send({
            error: 'Internal Server Error',
            message: 'Failed to delete Circle'
        });
    }
};

module.exports = function(fastify, opts, done) {
    fastify.delete('/circles/:id', deleteCircle);
    done();
}; 