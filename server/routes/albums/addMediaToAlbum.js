const { ObjectId } = require('mongodb');
const { getDb, getCollection } = require('../utils/db');
const { verifyToken } = require('../auth/authMiddleware');

/**
 * Route handler for adding media to an album
 * POST /api/albums/:id/media
 * Request body: { mediaIds: string[] }
 */
const addMediaToAlbumHandler = async (request, reply) => {
    // Check if user is authenticated
    if (!request.user) {
        return reply.code(401).send({ 
            error: 'Unauthorized',
            message: 'Authentication required'
        });
    }

    const userId = request.user._id;
    const albumId = request.params.id;
    const { mediaIds } = request.body;
    
    // Validate albumId format
    if (!ObjectId.isValid(albumId)) {
        return reply.code(400).send({
            error: 'Invalid album ID',
            message: 'The provided album ID is not valid'
        });
    }
    
    // Validate mediaIds
    if (!mediaIds || !Array.isArray(mediaIds) || mediaIds.length === 0) {
        return reply.code(400).send({
            error: 'Bad Request',
            message: 'Media IDs array is required and must contain at least one ID'
        });
    }
    
    // Validate each mediaId
    for (const mediaId of mediaIds) {
        if (!ObjectId.isValid(mediaId)) {
            return reply.code(400).send({
                error: 'Invalid media ID',
                message: `The provided media ID '${mediaId}' is not valid`
            });
        }
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
        
        // Verify that the media items exist and belong to this user
        const objectIdMediaIds = mediaIds.map(id => new ObjectId(id));
        const verifyMedia = await filesCollection.find({
            _id: { $in: objectIdMediaIds },
            userId: userId
        }).toArray();
        
        if (verifyMedia.length !== mediaIds.length) {
            return reply.code(404).send({
                error: 'Not found',
                message: 'One or more media items were not found or do not belong to you'
            });
        }
        
        // Add the album ID to each media item's albums array (if not already there)
        const objectIdAlbumId = new ObjectId(albumId);
        await filesCollection.updateMany(
            {
                _id: { $in: objectIdMediaIds },
                albums: { $ne: objectIdAlbumId }
            },
            {
                $push: { albums: objectIdAlbumId }
            }
        );
        
        // Check if the album already has a thumbnail, if not, choose the oldest file's thumbnail
        if (!album.thumbnailId) {
            // Get all files in this album after adding new files
            const allAlbumFiles = await filesCollection
                .find({ 
                    userId: userId,
                    albums: objectIdAlbumId
                })
                .sort({ _id: 1 }) // Sort by _id in ascending order (oldest first based on ObjectId)
                .limit(1) // Get just the oldest file
                .toArray();
            
            // If we have files, use the oldest one's ID as the thumbnail
            if (allAlbumFiles.length > 0) {
                const oldestFileId = allAlbumFiles[0]._id;
                
                // Update the album with the thumbnail ID (store as ObjectId)
                await albumsCollection.updateOne(
                    { _id: new ObjectId(albumId) },
                    { 
                        $set: { 
                            thumbnailId: oldestFileId,
                            updatedAt: new Date() 
                        } 
                    }
                );
            }
        } else {
            // Just update the timestamp if thumbnail already exists
            await albumsCollection.updateOne(
                { _id: new ObjectId(albumId) },
                { $set: { updatedAt: new Date() } }
            );
        }
        
        // Return the updated album with files
        const updatedAlbum = await albumsCollection.findOne({
            _id: new ObjectId(albumId)
        });
        
        // Get all files in this album
        const files = await filesCollection
            .find({ 
                userId: userId,
                albums: objectIdAlbumId
            })
            .toArray();
        
        return {
            ...updatedAlbum,
            files
        };
    } catch (err) {
        console.error('Error adding media to album:', err);
        return reply.code(500).send({ error: 'Failed to add media to album' });
    }
};

module.exports = function(fastify, opts, done) {
    fastify.post('/albums/:id/media', { preHandler: verifyToken }, addMediaToAlbumHandler);
    done();
}; 