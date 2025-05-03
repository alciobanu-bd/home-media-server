/**
 * Get all circle invitations for the current user
 * GET /api/circles/invitations
 */

const { getDb, getCollection } = require('../utils/db');
const { verifyToken } = require('../auth/authMiddleware');

const getUserInvitationsHandler = async (request, reply) => {
    // Check if user is authenticated
    if (!request.user) {
        return reply.code(401).send({ 
            error: 'Unauthorized',
            message: 'Authentication required'
        });
    }

    const userEmail = request.user.email;
  
    try {
        const db = getDb();
        const circlesCollection = getCollection(db, 'circles');
        
        // Find all circles where the user's email is in the invitations
        const circles = await circlesCollection.find({ 
            'invitations.email': userEmail 
        }).toArray();
        
        // Extract invitations specific to this user
        const invitations = circles.map(circle => {
            const invitation = circle.invitations.find(inv => inv.email === userEmail);
            return {
                circleId: circle._id,
                circleName: circle.name,
                token: invitation.token,
                invitedAt: invitation.invitedAt
            };
        });
        
        return { invitations };
    } catch (err) {
        console.error('Error getting user invitations:', err);
        return reply.code(500).send({ error: 'Failed to get invitations' });
    }
};

module.exports = function(fastify, opts, done) {
    fastify.get('/circles/invitations', { preHandler: verifyToken }, getUserInvitationsHandler);
    done();
}; 