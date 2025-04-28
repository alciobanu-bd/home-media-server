const { ObjectId } = require('mongodb');
const { getDb, getCollection } = require('../utils/db');
const { verifyToken } = require('../auth/authMiddleware');

/**
 * Route handler for removing media from an album
 * DELETE /api/albums/:id/media/:mediaId
 */
const removeMediaFromAlbumHandler = async (request, reply) => {
    // Check if user is authenticated
    if (!request.user) {
        return reply.code(401).send({ 
            error: 'Unauthorized',
            message: 'Authentication required'
        });
    }

    const userId = request.user._id;
    const albumId = request.params.id;
    const mediaId = request.params.mediaId;
    
    // Validate albumId format
    if (!ObjectId.isValid(albumId)) {
        return reply.code(400).send({
            error: 'Invalid album ID',
            message: 'The provided album ID is not valid'
        });
    }
    
    // Validate mediaId format
    if (!ObjectId.isValid(mediaId)) {
        return reply.code(400).send({
            error: 'Invalid media ID',
            message: 'The provided media ID is not valid'
        });
    }

    try {
        const db = getDb();
        const albumsCollection = getCollection(db, 'albums');
        const filesCollection = getCollection(db, 'files');
        
        // First check if the album exists and belongs to this user
        const album = await albumsCollection.findOne({
            _id: new ObjectId(albumId),
            userId: userId
        });
        
        if (!album) {
            return reply.code(404).send({
                error: 'Not found',
                message: 'Album not found or you do not have permission to access it'
            });
        }
        
        // Remove the album ID from the media item's albums array
        const result = await filesCollection.updateOne(
            {
                _id: new ObjectId(mediaId),
                userId: userId,
                albums: albumId
            },
            {
                $pull: { albums: albumId }
            }
        );
        
        if (result.modifiedCount === 0) {
            return reply.code(404).send({
                error: 'Not found',
                message: 'Media item not found, not in this album, or you do not have permission to remove it'
            });
        }
        
        // Update the album's updatedAt timestamp
        await albumsCollection.updateOne(
            { _id: new ObjectId(albumId) },
            { $set: { updatedAt: new Date() } }
        );
        
        return { success: true, message: 'Media item removed from album successfully' };
    } catch (err) {
        console.error('Error removing media from album:', err);
        return reply.code(500).send({ error: 'Failed to remove media from album' });
    }
};

module.exports = function(fastify, opts, done) {
    fastify.delete('/albums/:id/media/:mediaId', { preHandler: verifyToken }, removeMediaFromAlbumHandler);
    done();
}; 