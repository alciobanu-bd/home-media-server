/**
 * Create a new Circle
 * POST /api/circles
 */

const { ObjectId } = require('mongodb');
const { getDb, getCollection } = require('../utils/db');

const createCircle = async (request, reply) => {
    // Must be authenticated
    if (!request.user) {
        return reply.code(401).send({
            error: 'Unauthorized',
            message: 'You must be logged in to create a Circle'
        });
    }

    const { name, description } = request.body;
    
    if (!name || name.trim() === '') {
        return reply.code(400).send({
            error: 'Bad Request',
            message: 'Circle name is required'
        });
    }
    
    // Validate description length if provided
    if (description && description.length > 150) {
        return reply.code(400).send({
            error: 'Bad Request',
            message: 'Circle description cannot exceed 150 characters'
        });
    }

    try {
        const db = getDb();
        const circlesCollection = getCollection(db, 'circles');
        
        const newCircle = {
            name,
            description: description || '',
            createdAt: new Date(),
            createdBy: new ObjectId(request.user._id),
            adminIds: [new ObjectId(request.user._id)],
            memberIds: [new ObjectId(request.user._id)],
            invitations: []
        };
        
        const result = await circlesCollection.insertOne(newCircle);
        
        return {
            success: true,
            message: 'Circle created successfully',
            circleId: result.insertedId
        };
    } catch (error) {
        request.log.error(`Error creating circle: ${error.message}`);
        return reply.code(500).send({
            error: 'Internal Server Error',
            message: 'Failed to create Circle'
        });
    }
};

module.exports = function(fastify, opts, done) {
    fastify.post('/circles', createCircle);
    done();
}; 