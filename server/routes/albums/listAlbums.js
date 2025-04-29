const { getDb, getCollection } = require('../utils/db');
const { verifyToken } = require('../auth/authMiddleware');

/**
 * Route handler for listing all albums belonging to a user
 * GET /api/albums
 */
const listAlbumsHandler = async (request, reply) => {
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
        const albumsCollection = getCollection(db, 'albums');
        const filesCollection = getCollection(db, 'files');
        
        // Get all albums belonging to this user, sorted by creation date (newest first)
        const albums = await albumsCollection
            .find({ userId })
            .sort({ createdAt: -1 })
            .toArray();
        
        // For each album, get the file count
        const albumsWithCount = await Promise.all(albums.map(async (album) => {
            const fileCount = await filesCollection.countDocuments({
                userId: userId,
                albums: album._id.toString()
            });
            
            return {
                ...album,
                fileCount
            };
        }));
        
        return { albums: albumsWithCount };
    } catch (err) {
        console.error('Error fetching albums:', err);
        return reply.code(500).send({ error: 'Failed to fetch albums' });
    }
};

module.exports = function(fastify, opts, done) {
    fastify.get('/albums', { preHandler: verifyToken }, listAlbumsHandler);
    done();
}; 