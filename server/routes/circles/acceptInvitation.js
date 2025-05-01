/**
 * Accept a Circle invitation
 * GET /api/circles/accept-invite/:token
 */

const { ObjectId } = require('mongodb');
const { getDb, getCollection } = require('../utils/db');

const acceptInvitation = async (request, reply) => {
    // Must be authenticated
    if (!request.user) {
        return reply.code(401).send({
            error: 'Unauthorized',
            message: 'You must be logged in to accept an invitation'
        });
    }

    const { token } = request.params;
    
    if (!token) {
        return reply.code(400).send({
            error: 'Bad Request',
            message: 'Invalid invitation token'
        });
    }

    try {
        const db = getDb();
        const circlesCollection = getCollection(db, 'circles');
        const userId = new ObjectId(request.user._id);
        const userEmail = request.user.email;
        
        // Find circle with matching invitation token
        const circle = await circlesCollection.findOne({ 
            'invitations.token': token 
        });
        
        if (!circle) {
            return reply.code(404).send({
                error: 'Not Found',
                message: 'Invalid or expired invitation'
            });
        }
        
        // Find the specific invitation
        const invitation = circle.invitations.find(inv => inv.token === token);
        
        // Verify email matches
        if (invitation.email !== userEmail) {
            return reply.code(403).send({
                error: 'Forbidden',
                message: 'This invitation was sent to a different email address'
            });
        }
        
        // Add user to members and remove invitation
        await circlesCollection.updateOne(
            { _id: circle._id },
            { 
                $addToSet: { memberIds: userId },
                $pull: { invitations: { token } }
            }
        );
        
        return {
            success: true,
            message: 'You have successfully joined the Circle',
            circleId: circle._id
        };
    } catch (error) {
        request.log.error(`Error accepting invitation: ${error.message}`);
        return reply.code(500).send({
            error: 'Internal Server Error',
            message: 'Failed to accept invitation'
        });
    }
};

module.exports = function(fastify, opts, done) {
    fastify.get('/circles/accept-invite/:token', acceptInvitation);
    done();
}; 