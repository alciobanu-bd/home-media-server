/**
 * Get a single Circle by ID
 * GET /api/circles/:id
 */

const { ObjectId } = require('mongodb');
const { getDb, getCollection } = require('../utils/db');

const getCircleById = async (request, reply) => {
    // Must be authenticated
    if (!request.user) {
        return reply.code(401).send({
            error: 'Unauthorized',
            message: 'You must be logged in to view Circle details'
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
        const usersCollection = getCollection(db, 'users');
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
        
        // Check if user is a member or admin
        if (!circle.memberIds.some(id => id.toString() === userId.toString())) {
            return reply.code(403).send({
                error: 'Forbidden',
                message: 'You do not have access to this Circle'
            });
        }
        
        // Get member details
        const memberIds = circle.memberIds.map(id => id);
        const members = await usersCollection.find({
            _id: { $in: memberIds }
        }, {
            projection: { _id: 1, name: 1, email: 1, picture: 1 }
        }).toArray();
        
        // Determine if user is an admin
        const isAdmin = circle.adminIds.some(id => id.toString() === userId.toString());
        
        return {
            id: circle._id,
            name: circle.name,
            description: circle.description,
            createdAt: circle.createdAt,
            isAdmin,
            members: members.map(member => ({
                id: member._id,
                name: member.name,
                email: member.email,
                picture: member.picture,
                isAdmin: circle.adminIds.some(id => id.toString() === member._id.toString())
            })),
            invitations: isAdmin ? circle.invitations : []
        };
    } catch (error) {
        request.log.error(`Error fetching circle details: ${error.message}`);
        return reply.code(500).send({
            error: 'Internal Server Error',
            message: 'Failed to fetch Circle details'
        });
    }
};

module.exports = function(fastify, opts, done) {
    fastify.get('/circles/:id', getCircleById);
    done();
}; 