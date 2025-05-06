/**
 * Delete a Circle
 * DELETE /api/circles/:id
 */

const { ObjectId } = require('mongodb');
const { getDb, getCollection } = require('../utils/db');

const deleteCircle = async (request, reply) => {
    // Must be authenticated
    if (!request.user) {
        return reply.code(401).send({
            error: 'Unauthorized',
            message: 'You must be logged in to delete a Circle'
        });
    }

    const { id } = request.params;
    
    if (!id || !ObjectId.isValid(id)) {
        return reply.code(400).send({
            error: 'Bad Request',
            message: 'Invalid Circle ID'
        });
    }

    try {
        const db = getDb();
        const circlesCollection = getCollection(db, 'circles');
        const albumsCollection = getCollection(db, 'albums');
        const userId = new ObjectId(request.user._id);
        const circleId = new ObjectId(id);
        
        // Find the circle
        const circle = await circlesCollection.findOne({ _id: circleId });
        
        if (!circle) {
            return reply.code(404).send({
                error: 'Not Found',
                message: 'Circle not found'
            });
        }
        
        // Check if user is an admin
        if (!circle.adminIds.some(id => id.toString() === userId.toString())) {
            return reply.code(403).send({
                error: 'Forbidden',
                message: 'Only Circle admins can delete a Circle'
            });
        }
        
        // Find all albums that reference this circle
        const affectedAlbums = await albumsCollection.find({ 
            circleIds: circleId 
        }).toArray();
        
        // Begin a session for the transaction
        const session = db.client.startSession();
        
        try {
            await session.withTransaction(async () => {
                // Remove the circle ID from all albums that reference it
                if (affectedAlbums.length > 0) {
                    await albumsCollection.updateMany(
                        { circleIds: circleId },
                        { $pull: { circleIds: circleId } },
                        { session }
                    );
                    
                    request.log.info(`Removed circle ${id} from ${affectedAlbums.length} albums`);
                }
                
                // Delete the circle
                await circlesCollection.deleteOne(
                    { _id: circleId },
                    { session }
                );
            });
        } finally {
            await session.endSession();
        }
        
        return {
            success: true,
            message: 'Circle deleted successfully',
            affectedAlbums: affectedAlbums.length
        };
    } catch (error) {
        request.log.error(`Error deleting circle: ${error.message}`);
        return reply.code(500).send({
            error: 'Internal Server Error',
            message: 'Failed to delete Circle'
        });
    }
};

module.exports = function(fastify, opts, done) {
    fastify.delete('/circles/:id', deleteCircle);
    done();
}; 