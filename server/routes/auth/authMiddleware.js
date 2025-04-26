const jwt = require('jsonwebtoken');
const { getDb, getCollection } = require('../utils/db');
const { ObjectId } = require('mongodb');

/**
 * Middleware to verify JWT token and attach user to request
 * @param {object} request - Fastify request object
 * @param {object} reply - Fastify reply object
 */
const verifyToken = async (request, reply) => {
  try {
    // Get token from cookies or Authorization header
    const token = request.cookies.auth_token || 
      (request.headers.authorization && request.headers.authorization.split(' ')[1]);
    
    if (!token) {
      request.user = null;
      return;
    }
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const db = getDb();
    const usersCollection = getCollection(db, 'users');
    
    const user = await usersCollection.findOne({ _id: new ObjectId(decoded.userId) });
    
    if (!user) {
      request.user = null;
      return;
    }
    
    // Attach user to request
    request.user = user;
  } catch (error) {
    console.error('Token verification error:', error.message);
    request.user = null;
  }
};

/**
 * Middleware to require authentication
 * @param {object} request - Fastify request object
 * @param {object} reply - Fastify reply object
 */
const requireAuth = async (request, reply) => {
  if (!request.user) {
    return reply.code(401).send({ 
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }
};

module.exports = {
  verifyToken,
  requireAuth
}; 