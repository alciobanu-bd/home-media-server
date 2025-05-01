/**
 * Trusted Circles API Routes
 * Routes for managing user groups (Trusted Circles)
 */

// Import route modules
const createCircleRoute = require('./createCircle');
const getUserCirclesRoute = require('./getUserCircles');
const getCircleByIdRoute = require('./getCircleById');
const inviteToCircleRoute = require('./inviteToCircle');
const acceptInvitationRoute = require('./acceptInvitation');
const makeAdminRoute = require('./makeAdmin');
const removeFromCircleRoute = require('./removeFromCircle');
const deleteCircleRoute = require('./deleteCircle');

/**
 * Register all Circle routes
 */
module.exports = function(fastify, opts, done) {
    // Register all Circle route modules
    fastify.register(createCircleRoute);
    fastify.register(getUserCirclesRoute);
    fastify.register(getCircleByIdRoute);
    fastify.register(inviteToCircleRoute);
    fastify.register(acceptInvitationRoute);
    fastify.register(makeAdminRoute);
    fastify.register(removeFromCircleRoute);
    fastify.register(deleteCircleRoute);
    
    done();
}; 