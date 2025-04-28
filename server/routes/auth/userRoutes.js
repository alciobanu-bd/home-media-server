/**
 * User-related API endpoints
 */

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
const getCurrentUser = async (request, reply) => {
    if (!request.user) {
        return reply.code(401).send({
            error: 'Unauthorized',
            message: 'Not authenticated'
        });
    }
  
    // Return user data without sensitive fields
    const { _id, name, email, picture, createdAt } = request.user;
    return { 
        id: _id,
        name, 
        email, 
        picture,
        createdAt
    };
};

/**
 * Logout user by clearing auth cookie
 * GET /api/auth/logout
 */
const logoutUser = async (request, reply) => {
    reply.clearCookie('auth_token', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    });
  
    return { 
        success: true,
        message: 'Logged out successfully'
    };
};

module.exports = function(fastify, opts, done) {
    fastify.get('/auth/me', getCurrentUser);
    fastify.get('/auth/logout', logoutUser);
    done();
}; 