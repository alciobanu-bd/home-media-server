/**
 * Decline a Circle invitation
 * DELETE /api/circles/invitations/:token
 */

const { getDb, getCollection } = require('../utils/db');
const { verifyToken } = require('../auth/authMiddleware');

const declineInvitationHandler = async (request, reply) => {
    // Must be authenticated
    if (!request.user) {
        return reply.code(401).send({
            error: 'Unauthorized',
            message: 'You must be logged in to decline an invitation'
        });
    }

    const { token } = request.params;
    const userEmail = request.user.email;
    
    if (!token) {
        return reply.code(400).send({
            error: 'Bad Request',
            message: 'Invalid invitation token'
        });
    }

    try {
        const db = getDb();
        const circlesCollection = getCollection(db, 'circles');
        
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
        
        // Remove the invitation
        await circlesCollection.updateOne(
            { _id: circle._id },
            { $pull: { invitations: { token } } }
        );
        
        return {
            success: true,
            message: 'Invitation declined successfully'
        };
    } catch (error) {
        console.error(`Error declining invitation: ${error.message}`);
        return reply.code(500).send({
            error: 'Internal Server Error',
            message: 'Failed to decline invitation'
        });
    }
};

module.exports = function(fastify, opts, done) {
    fastify.delete('/circles/invitations/:token', { preHandler: verifyToken }, declineInvitationHandler);
    done();
}; 