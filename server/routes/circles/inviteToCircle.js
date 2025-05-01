/**
 * Invite a user to a Circle
 * POST /api/circles/:id/invite
 */

const { ObjectId } = require('mongodb');
const { getDb, getCollection } = require('../utils/db');
const crypto = require('crypto');

const inviteToCircle = async (request, reply) => {
    // Must be authenticated
    if (!request.user) {
        return reply.code(401).send({
            error: 'Unauthorized',
            message: 'You must be logged in to invite users'
        });
    }

    const { id } = request.params;
    const { email } = request.body;
    
    if (!id || !ObjectId.isValid(id)) {
        return reply.code(400).send({
            error: 'Bad Request',
            message: 'Invalid Circle ID'
        });
    }
    
    if (!email || !email.includes('@')) {
        return reply.code(400).send({
            error: 'Bad Request',
            message: 'Valid email is required for invitation'
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
        
        // Check if user is an admin
        if (!circle.adminIds.some(id => id.toString() === userId.toString())) {
            return reply.code(403).send({
                error: 'Forbidden',
                message: 'Only Circle admins can invite users'
            });
        }
        
        // Check if email is already in the system
        const invitedUser = await usersCollection.findOne({ email });
        
        // If user exists, check if already a member
        if (invitedUser && circle.memberIds.some(id => id.toString() === invitedUser._id.toString())) {
            return reply.code(400).send({
                error: 'Bad Request',
                message: 'User is already a member of this Circle'
            });
        }
        
        // Check if already invited
        if (circle.invitedEmails.includes(email)) {
            return reply.code(400).send({
                error: 'Bad Request',
                message: 'This email has already been invited'
            });
        }
        
        // Create invitation
        const invitation = {
            email,
            invitedBy: userId,
            invitedAt: new Date(),
            token: crypto.randomBytes(32).toString('hex')
        };
        
        // Add to circle invitations
        await circlesCollection.updateOne(
            { _id: circleId },
            { 
                $push: { invitations: invitation },
                $addToSet: { invitedEmails: email }
            }
        );
        
        // TODO: In a real implementation, we would send an email with the invitation link
        
        return {
            success: true,
            message: 'Invitation sent successfully'
        };
    } catch (error) {
        request.log.error(`Error inviting to circle: ${error.message}`);
        return reply.code(500).send({
            error: 'Internal Server Error',
            message: 'Failed to send invitation'
        });
    }
};

module.exports = function(fastify, opts, done) {
    fastify.post('/circles/:id/invite', inviteToCircle);
    done();
}; 