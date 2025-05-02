const { getDb, getCollection } = require('../utils/db');
const { ObjectId } = require('mongodb');
const { verifyToken } = require('../auth/authMiddleware');

/**
 * Route handler for getting a single media item with its metadata
 * GET /api/media/:id
 */
const getMediaItemHandler = async (request, reply) => {
    const { id } = request.params;
  
    // Check if user is authenticated
    if (!request.user) {
        return reply.code(401).send({ 
            error: 'Unauthorized',
            message: 'Authentication required'
        });
    }

    const userId = request.user._id;
  
    try {
        const fileId = new ObjectId(id);
        const db = getDb();
    
        // Get file information
        const filesCollection = getCollection(db, 'files');
        const file = await filesCollection.findOne({ _id: fileId });
    
        if (!file) {
            return reply.code(404).send({ error: 'File not found' });
        }
    
        // Check permissions: either the file belongs to the user OR
        // the file is in an album that's shared with a circle the user is in
        let hasAccess = false;

        // Direct ownership check
        if (file.userId && file.userId.toString() === userId.toString()) {
            hasAccess = true;
        } 
        // Circle sharing check
        else if (file.albums && file.albums.length > 0) {
            // Get circles the user is a member of
            const circlesCollection = getCollection(db, 'circles');
            const userObjectId = new ObjectId(userId);
            const userCircles = await circlesCollection.find({
                memberIds: userObjectId
            }).toArray();
            
            const userCircleIds = userCircles.map(circle => circle._id.toString());
            
            // Check if any of the file's albums are shared with user's circles
            const albumsCollection = getCollection(db, 'albums');
            const sharedAlbums = await albumsCollection.find({
                _id: { $in: file.albums.map(albumId => {
                    return ObjectId.isValid(albumId) ? new ObjectId(albumId) : null;
                }).filter(id => id !== null) },
                circleIds: { $in: userCircleIds }
            }).toArray();
            
            if (sharedAlbums.length > 0) {
                hasAccess = true;
            }
        }
        
        if (!hasAccess) {
            return reply.code(403).send({ 
                error: 'Forbidden',
                message: 'You do not have permission to access this media item'
            });
        }
    
        // Get metadata
        const metadataCollection = getCollection(db, 'metadata');
        const metadata = await metadataCollection.findOne({ file_id: fileId });
    
        // Combine file info with metadata
        const mediaItem = {
            ...file,
            metadata: metadata || {}
        };
    
        return mediaItem;
    } catch (err) {
        console.error('Error getting media item:', err);
        if (err.name === 'BSONError' || err.name === 'BSONTypeError') {
            return reply.code(400).send({ error: 'Invalid ID format' });
        }
        return reply.code(500).send({ error: 'Failed to get media item' });
    }
};

module.exports = function(fastify, opts, done) {
    fastify.get('/media/:id', { preHandler: verifyToken }, getMediaItemHandler);
    done();
}; 