/**
 * Get all Circles for the current user
 * GET /api/circles
 */

const { ObjectId } = require('mongodb');
const { getDb, getCollection } = require('../utils/db');

const getUserCircles = async (request, reply) => {
    // Must be authenticated
    if (!request.user) {
        return reply.code(401).send({
            error: 'Unauthorized',
            message: 'You must be logged in to view Circles'
        });
    }

    try {
        const db = getDb();
        const circlesCollection = getCollection(db, 'circles');
        const userId = new ObjectId(request.user._id);
        
        // Find all circles where user is a member or admin
        const circles = await circlesCollection.find({ 
            $or: [
                { memberIds: userId },
                { adminIds: userId }
            ]
        }).toArray();
        
        return {
            circles: circles.map(circle => ({
                id: circle._id,
                name: circle.name,
                description: circle.description,
                createdAt: circle.createdAt,
                isAdmin: circle.adminIds.some(id => id.toString() === userId.toString()),
                memberCount: circle.memberIds.length
            }))
        };
    } catch (error) {
        request.log.error(`Error fetching user circles: ${error.message}`);
        return reply.code(500).send({
            error: 'Internal Server Error',
            message: 'Failed to fetch Circles'
        });
    }
};

module.exports = function(fastify, opts, done) {
    fastify.get('/api/circles', getUserCircles);
    done();
}; 