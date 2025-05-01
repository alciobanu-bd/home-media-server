/**
 * Update Circle details
 * PUT /api/circles/:id
 */

const { ObjectId } = require('mongodb');
const { getDb, getCollection } = require('../utils/db');

const updateCircle = async (request, reply) => {
    // Must be authenticated
    if (!request.user) {
        return reply.code(401).send({
            error: 'Unauthorized',
            message: 'You must be logged in to update a Circle'
        });
    }

    const userId = new ObjectId(request.user._id);
    const circleId = request.params.id;
    const { description } = request.body;
    
    // Validate circleId format
    if (!ObjectId.isValid(circleId)) {
        return reply.code(400).send({
            error: 'Invalid Circle ID',
            message: 'The provided Circle ID is not valid'
        });
    }
    
    // Validate description length if provided
    if (description !== undefined && description.length > 150) {
        return reply.code(400).send({
            error: 'Bad Request',
            message: 'Circle description cannot exceed 150 characters'
        });
    }
    
    try {
        const db = getDb();
        const circlesCollection = getCollection(db, 'circles');
        
        // First check if user is an admin of this circle
        const circle = await circlesCollection.findOne({ 
            _id: new ObjectId(circleId),
            adminIds: userId
        });
        
        if (!circle) {
            return reply.code(404).send({
                error: 'Not Found',
                message: 'Circle not found or you do not have permission to update it'
            });
        }
        
        // Prepare update object based on what's provided
        const updateData = {
            updatedAt: new Date()
        };
        
        if (description !== undefined) {
            updateData.description = description;
        }
        
        // Update the circle
        await circlesCollection.updateOne(
            { _id: new ObjectId(circleId) },
            { $set: updateData }
        );
        
        return {
            success: true,
            message: 'Circle updated successfully'
        };
    } catch (error) {
        request.log.error(`Error updating circle: ${error.message}`);
        return reply.code(500).send({
            error: 'Internal Server Error',
            message: 'Failed to update Circle'
        });
    }
};

module.exports = function(fastify, opts, done) {
    fastify.put('/circles/:id', updateCircle);
    done();
}; 