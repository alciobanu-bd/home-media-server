const { ObjectId } = require('mongodb');
const { getDb, getCollection } = require('../utils/db');
const { verifyToken } = require('../auth/authMiddleware');

/**
 * Route handler for getting a circle's timeline
 * GET /api/circles/:id/timeline
 * 
 * Query parameters:
 * - timestamp: timestamp (ms since epoch) to get items older than this time (for pagination)
 */
const getCircleTimelineHandler = async (request, reply) => {
    // Check if user is authenticated
    if (!request.user) {
        return reply.code(401).send({ 
            error: 'Unauthorized',
            message: 'Authentication required'
        });
    }

    const userId = request.user._id;
    const { id: circleId } = request.params;
    const { timestamp } = request.query;
    
    // Validate circleId format
    if (!ObjectId.isValid(circleId)) {
        return reply.code(400).send({
            error: 'Invalid circle ID',
            message: 'The provided circle ID is not valid'
        });
    }

    try {
        const db = getDb();
        const circlesCollection = getCollection(db, 'circles');
        const filesCollection = getCollection(db, 'files');
        const albumsCollection = getCollection(db, 'albums');
        const usersCollection = getCollection(db, 'users');

        // Check if the circle exists and the user is a member
        const circle = await circlesCollection.findOne({
            _id: new ObjectId(String(circleId)),
            memberIds: new ObjectId(String(userId))
        });

        if (!circle) {
            return reply.code(404).send({
                error: 'Not found',
                message: 'Circle not found or you are not a member'
            });
        }

        // Get all users in the circle to create a user map for faster lookups
        const circleMembers = await usersCollection.find({
            _id: { $in: circle.memberIds.map(id => new ObjectId(String(id))) }
        }).toArray();

        const userMap = {};
        circleMembers.forEach(user => {
            userMap[user._id.toString()] = {
                id: user._id.toString(),
                name: user.name || user.email.split('@')[0],
                picture: user.picture || null
            };
        });

        const objectIdCircleId = new ObjectId(String(circleId));
        
        // Build query filters based on timestamp
        let fileQuery = { circleIds: objectIdCircleId };
        let albumQuery = { circleIds: objectIdCircleId };
        
        if (timestamp) {
            const timestampDate = new Date(parseInt(timestamp));
            fileQuery.uploadedAt = { $lt: timestampDate };
            albumQuery.updatedAt = { $lt: timestampDate };
        }
        
        // Query files and albums with separate limits
        const sharedFiles = await filesCollection.find(fileQuery)
            .sort({ uploadedAt: -1 })
            .limit(50)
            .toArray();
        
        const sharedAlbums = await albumsCollection.find(albumQuery)
            .sort({ updatedAt: -1 })
            .limit(10)
            .toArray();
        
        console.log(`Found ${sharedFiles.length} files and ${sharedAlbums.length} albums shared with circle ${circleId}`);
        
        // Find the oldest timestamp between the two result sets
        let oldestFileTimestamp = null;
        let oldestAlbumTimestamp = null;
        
        if (sharedFiles.length > 0) {
            // Last file is the oldest due to sort order
            oldestFileTimestamp = sharedFiles[sharedFiles.length - 1].uploadedAt;
        }
        
        if (sharedAlbums.length > 0) {
            // Last album is the oldest due to sort order
            oldestAlbumTimestamp = sharedAlbums[sharedAlbums.length - 1].updatedAt;
        }
        
        // Determine the cutoff timestamp (the newer of the two oldest timestamps)
        let cutoffTimestamp = null;
        
        if (oldestFileTimestamp && oldestAlbumTimestamp) {
            // Take the newer timestamp (the max of the two oldest)
            cutoffTimestamp = oldestFileTimestamp > oldestAlbumTimestamp ? 
                oldestFileTimestamp : oldestAlbumTimestamp;
        } else {
            // If one is null, take the other
            cutoffTimestamp = oldestFileTimestamp || oldestAlbumTimestamp;
        }
        
        // Process albums and get preview files
        const processedAlbums = [];
        for (const album of sharedAlbums) {
            // Skip if older than cutoff timestamp
            if (cutoffTimestamp && album.updatedAt < cutoffTimestamp) {
                continue;
            }
            
            // Get files that reference this album for preview
            const albumFiles = await filesCollection.find({
                userId: album.userId,
                albums: album._id
            }).sort({ uploadedAt: -1 }).limit(4).toArray();
            
            // Get file count for this album
            const fileCount = await filesCollection.countDocuments({
                userId: album.userId,
                albums: album._id
            });
            
            // Make sure we have a valid owner
            const albumUserId = album.userId.toString();
            const owner = userMap[albumUserId] || { 
                id: albumUserId,
                name: 'Unknown User',
                picture: null
            };
            
            // Get album timestamp
            let albumTimestamp;
            if (album.updatedAt) {
                albumTimestamp = album.updatedAt.getTime();
            } else if (album.createdAt) {
                albumTimestamp = album.createdAt.getTime();
            } else {
                albumTimestamp = new Date().getTime();
            }
            
            processedAlbums.push({
                type: 'album',
                id: album._id.toString(),
                ownerId: albumUserId,
                owner: owner,
                item: {
                    id: album._id.toString(),
                    name: album.name || 'Unnamed album',
                    description: album.description || '',
                    fileCount: fileCount,
                    thumbnailId: album.thumbnailId || 
                               (albumFiles.length > 0 ? albumFiles[0]._id.toString() : null),
                    previewFiles: albumFiles.map(file => ({
                        id: file._id.toString(),
                        thumbnailId: file._id.toString(),
                        originalName: file.originalName,
                        mimetype: file.mimetype,
                        size: file.size,
                        createdAt: file.createdAt,
                        uploadedAt: file.uploadedAt
                    }))
                },
                createdAt: album.createdAt || new Date(),
                updatedAt: album.updatedAt || album.createdAt || new Date(),
                timestamp: albumTimestamp
            });
        }
        
        // Process files
        const processedFiles = [];
        for (const file of sharedFiles) {
            // Skip if older than cutoff timestamp or doesn't have necessary properties
            if ((cutoffTimestamp && file.uploadedAt < cutoffTimestamp) || 
                !file || !file._id || !file.userId) {
                continue;
            }
            
            // Make sure we have a valid owner
            const fileUserId = file.userId.toString();
            const owner = userMap[fileUserId] || { 
                id: fileUserId,
                name: 'Unknown User',
                picture: null
            };
            
            // Get file timestamp
            let fileTimestamp;
            if (file.uploadedAt) {
                fileTimestamp = file.uploadedAt.getTime();
            } else if (file.createdAt) {
                fileTimestamp = file.createdAt.getTime();
            } else {
                fileTimestamp = new Date().getTime();
            }
            
            processedFiles.push({
                type: 'file',
                id: file._id.toString(),
                ownerId: fileUserId,
                owner: owner,
                item: {
                    id: file._id.toString(),
                    originalName: file.originalName || 'Unnamed file',
                    thumbnailId: file._id.toString(),
                    mimetype: file.mimetype || 'application/octet-stream',
                    size: file.size || 0
                },
                createdAt: file.uploadedAt || file.createdAt || new Date(),
                timestamp: fileTimestamp
            });
        }
        
        // Merge albums and files
        const timelineItems = [...processedAlbums, ...processedFiles];
        
        // Sort timeline items by timestamp (newest first)
        timelineItems.sort((a, b) => b.timestamp - a.timestamp);
        
        console.log(`Timeline items after merging and filtering: ${timelineItems.length}`);
        
        // Group consecutive items by owner and type
        const groupedTimeline = [];
        let currentGroup = null;

        timelineItems.forEach(item => {
            if (!currentGroup || currentGroup.ownerId !== item.ownerId || currentGroup.type !== item.type) {
                // Start a new group
                currentGroup = {
                    type: item.type,
                    ownerId: item.ownerId,
                    owner: item.owner,
                    timestamp: item.timestamp,
                    createdAt: item.createdAt,
                    items: [item.item]
                };
                groupedTimeline.push(currentGroup);
            } else {
                // Add to existing group if it's the same owner and type
                currentGroup.items.push(item.item);
                // Update timestamp to the newest
                if (item.timestamp > currentGroup.timestamp) {
                    currentGroup.timestamp = item.timestamp;
                    currentGroup.createdAt = item.createdAt;
                }
            }
        });
        
        console.log(`Grouped timeline items: ${groupedTimeline.length}`);
        
        // Determine the timestamp of the last (oldest) item for next page loading
        let nextPageTimestamp = null;
        if (timelineItems.length > 0) {
            nextPageTimestamp = timelineItems[timelineItems.length - 1].timestamp;
        }
        
        return {
            timeline: groupedTimeline,
            nextPageTimestamp: nextPageTimestamp
        };
    } catch (err) {
        console.error('Error getting circle timeline:', err);
        return reply.code(500).send({ 
            error: 'Server Error', 
            message: 'Failed to get circle timeline' 
        });
    }
};

module.exports = function(fastify, opts, done) {
    fastify.get('/circles/:id/timeline', { preHandler: verifyToken }, getCircleTimelineHandler);
    done();
}; 