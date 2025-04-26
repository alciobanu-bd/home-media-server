/**
 * Authentication routes index file
 */
const googleAuthRoute = require('./googleAuth');
const googleCallbackRoute = require('./googleCallback');
const userRoutes = require('./userRoutes');
const { verifyToken, requireAuth } = require('./authMiddleware');

module.exports = function(fastify, opts, done) {
  // Register the token verification middleware
  fastify.addHook('preHandler', verifyToken);
  
  // Register auth routes
  fastify.register(googleAuthRoute);
  fastify.register(googleCallbackRoute);
  fastify.register(userRoutes);
  
  done();
};

// Export middleware for use in other parts of the application
module.exports.verifyToken = verifyToken;
module.exports.requireAuth = requireAuth; 