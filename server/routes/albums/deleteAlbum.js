const { ObjectId } = require('mongodb');
const { getDb, getCollection } = require('../utils/db');
const { verifyToken } = require('../auth/authMiddleware');

/**
 * Route handler for deleting an album
 * DELETE /api/albums/:id
 */
const deleteAlbumHandler = async (request, reply) => {
    // Check if user is authenticated
    if (!request.user) {
        return reply.code(401).send({ 
            error: 'Unauthorized',
            message: 'Authentication required'
        });
    }

    const userId = request.user._id;
    const albumId = request.params.id;
    
    // Validate albumId format
    if (!ObjectId.isValid(albumId)) {
        return reply.code(400).send({
            error: 'Invalid album ID',
            message: 'The provided album ID is not valid'
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
                message: 'Album not found or you do not have permission to delete it'
            });
        }
        
        // Remove album reference from all files that were in this album
        await filesCollection.updateMany(
            { albums: albumId },
            { $pull: { albums: albumId } }
        );
        
        // Delete the album
        const result = await albumsCollection.deleteOne({
            _id: new ObjectId(albumId),
            userId: userId
        });
        
        if (result.deletedCount === 0) {
            return reply.code(404).send({
                error: 'Not found',
                message: 'Album not found or already deleted'
            });
        }
        
        return { success: true, message: 'Album deleted successfully' };
    } catch (err) {
        console.error('Error deleting album:', err);
        return reply.code(500).send({ error: 'Failed to delete album' });
    }
};

module.exports = function(fastify, opts, done) {
    fastify.delete('/albums/:id', { preHandler: verifyToken }, deleteAlbumHandler);
    done();
}; 