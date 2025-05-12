/**
 * Get subscription information for the current user
 * GET /api/user/subscription
 */

const { getDb, getCollection } = require('../utils/db');
const { verifyToken } = require('../auth/authMiddleware');
const { getTierConfig, getDefaultTier } = require('../utils/subscriptionTiers');

/**
 * Get the current user's subscription information
 */
const getUserSubscription = async (request, reply) => {
    // Check if user is authenticated
    if (!request.user) {
        return reply.code(401).send({
            error: 'Unauthorized',
            message: 'Authentication required'
        });
    }

    try {
        // Get the user's subscription tier (default to 'lite' if not set)
        const userTier = request.user.subscriptionTier || getDefaultTier();
        
        // Get full tier configuration
        const tierConfig = getTierConfig(userTier);
        
        return {
            tier: userTier,
            name: tierConfig.name,
            description: tierConfig.description,
            storageLimit: tierConfig.storageLimit,
            mediaQuality: tierConfig.mediaQuality
        };
    } catch (err) {
        console.error('Error getting user subscription:', err);
        return reply.code(500).send({
            error: 'Failed to retrieve subscription information',
            details: err.message
        });
    }
};

module.exports = function(fastify, opts, done) {
    fastify.get('/user/subscription', {
        preHandler: verifyToken
    }, getUserSubscription);
    
    done();
};
