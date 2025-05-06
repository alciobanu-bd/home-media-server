const { ObjectId } = require('mongodb');
const { getDb, getCollection } = require('../utils/db');
const { verifyToken } = require('../auth/authMiddleware');

/**
 * Route handler for updating an album's thumbnail
 * PUT /api/albums/:id/thumbnail
 * Request body: { thumbnailId: string }
 */
const updateAlbumThumbnailHandler = async (request, reply) => {
    // Check if user is authenticated
    if (!request.user) {
        return reply.code(401).send({ 
            error: 'Unauthorized',
            message: 'Authentication required'
        });
    }

    const userId = request.user._id;
    const albumId = request.params.id;
    const { thumbnailId } = request.body;
    
    // Validate albumId format
    if (!ObjectId.isValid(albumId)) {
        return reply.code(400).send({
            error: 'Invalid album ID',
            message: 'The provided album ID is not valid'
        });
    }
    
    // Validate thumbnailId
    if (!thumbnailId || !ObjectId.isValid(thumbnailId)) {
        return reply.code(400).send({
            error: 'Bad Request',
            message: 'Valid thumbnail ID is required'
        });
    }

    try {
        const db = getDb();
        const albumsCollection = getCollection(db, 'albums');
        const filesCollection = getCollection(db, 'files');
        
        // Convert albumId to ObjectId once
        const objectIdAlbumId = new ObjectId(String(albumId));
        const objectIdThumbnailId = new ObjectId(String(thumbnailId));
        
        // First check if the thumbnail file exists and belongs to this user and album
        const thumbnailFile = await filesCollection.findOne({
            _id: objectIdThumbnailId,
            userId: userId,
            albums: objectIdAlbumId
        });
        
        if (!thumbnailFile) {
            return reply.code(404).send({
                error: 'Not found',
                message: 'Thumbnail file not found or does not belong to this album'
            });
        }
        
        // Update the album with the new thumbnail ID
        const result = await albumsCollection.findOneAndUpdate(
            {
                _id: new ObjectId(albumId),
                userId: userId
            },
            {
                $set: {
                    thumbnailId: new ObjectId(thumbnailId),
                    updatedAt: new Date()
                }
            },
            {
                returnDocument: 'after'
            }
        );
        
        // Check if document was found and updated
        const updatedAlbum = result?.value || result;
        
        if (!updatedAlbum) {
            return reply.code(404).send({
                error: 'Not found',
                message: 'Album not found or you do not have permission to update it'
            });
        }
        
        // Return the updated album with string thumbnailId
        return {
            ...updatedAlbum,
            thumbnailId: updatedAlbum.thumbnailId.toString()
        };
    } catch (err) {
        console.error('Error updating album thumbnail:', err);
        return reply.code(500).send({ error: 'Failed to update album thumbnail' });
    }
};

module.exports = function(fastify, opts, done) {
    fastify.put('/albums/:id/thumbnail', { preHandler: verifyToken }, updateAlbumThumbnailHandler);
    done();
}; 