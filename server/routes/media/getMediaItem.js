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
        // the file is in an album that's shared with a circle the user is in OR
        // the file is directly shared with a circle the user is in
        let hasAccess = false;

        // Direct ownership check
        if (file.userId && file.userId.toString() === userId.toString()) {
            hasAccess = true;
        } 
        else {
            // Get circles the user is a member of
            const circlesCollection = getCollection(db, 'circles');
            const userObjectId = new ObjectId(userId);
            const userCircles = await circlesCollection.find({
                memberIds: userObjectId
            }).toArray();
            
            // Use ObjectIds consistently instead of converting to strings
            const userCircleObjectIds = userCircles.map(circle => circle._id);
            
            // Check if the file is directly shared with any of the user's circles
            if (file.circleIds && file.circleIds.length > 0) {
                // Check if any of the user's circle IDs directly matches any of the file's circle IDs
                // This approach works with MongoDB's BSON type comparison
                const hasSharedCircle = file.circleIds.some(fileCircleId => 
                    userCircleObjectIds.some(userCircleId => 
                        userCircleId.equals(fileCircleId)
                    )
                );
                
                if (hasSharedCircle) {
                    console.log(`User ${userId} has access to file ${fileId} through direct circle sharing`);
                    hasAccess = true;
                }
            }
            
            // If still no access, check album-based sharing
            if (!hasAccess && file.albums && file.albums.length > 0) {
                // Check if any of the file's albums are shared with user's circles
                const albumsCollection = getCollection(db, 'albums');
                const sharedAlbums = await albumsCollection.find({
                    _id: { $in: file.albums.map(albumId => {
                        return ObjectId.isValid(albumId) ? new ObjectId(albumId) : null;
                    }).filter(id => id !== null) },
                    circleIds: { $in: userCircleObjectIds }
                }).toArray();
                
                if (sharedAlbums.length > 0) {
                    console.log(`User ${userId} has access to file ${fileId} through album sharing`);
                    hasAccess = true;
                }
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