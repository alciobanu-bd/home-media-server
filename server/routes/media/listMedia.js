const { ObjectId } = require('mongodb');
const { getDb, getCollection } = require('../utils/db');
const { verifyToken } = require('../auth/authMiddleware');

/**
 * Route handler for getting paginated media list
 * GET /api/media
 */
const listMediaHandler = async (request, reply) => {
    const { lastId, limit = 20, sort = -1 } = request.query;
  
    // Check if user is authenticated
    if (!request.user) {
        return reply.code(401).send({ 
            error: 'Unauthorized',
            message: 'Authentication required'
        });
    }

    const userId = request.user._id;

    try {
        const db = getDb();
        const filesCollection = getCollection(db, 'files');
    
        // Build the query to filter by user ID
        const query = { userId: userId };
    
        // If lastId is provided, only get items created before that ID
        if (lastId) {
            try {
                const lastObjectId = new ObjectId(lastId);
                // Adjust query based on sort direction
                const compareOperator = sort == 1 ? '$gt' : '$lt';
                query._id = { [compareOperator]: lastObjectId };
            } catch (error) {
                return reply.code(400).send({ error: 'Invalid lastId format' });
            }
        }

        // Get media items
        const files = await filesCollection.find(query)
            .sort({ _id: parseInt(sort) })
            .limit(parseInt(limit))
            .toArray();

        return files;
    } catch (err) {
        console.error('Error listing media:', err);
        return reply.code(500).send({ error: 'Failed to list media items' });
    }
};

module.exports = function(fastify, opts, done) {
    fastify.get('/media', { preHandler: verifyToken }, listMediaHandler);
    done();
}; 