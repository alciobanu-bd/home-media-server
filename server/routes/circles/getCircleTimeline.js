const { ObjectId } = require('mongodb');
const { getDb, getCollection } = require('../utils/db');
const { verifyToken } = require('../auth/authMiddleware');

/**
 * Route handler for getting a circle's timeline
 * GET /api/circles/:id/timeline
 */
const getCircleTimelineHandler = async (request, reply) => {
    // Check if user is authenticated
    if (!request.user) {
        return reply.code(401).send({ 
            error: 'Unauthorized',
            message: 'Authentication required'
        });
    }

    // Helper function to determine album timestamp
    function getAlbumTimestamp(album) {
        if (album.updatedAt) {
            return album.updatedAt.getTime();
        } else if (album.createdAt) {
            return album.createdAt.getTime();
        } else {
            return new Date().getTime();
        }
    }

    const userId = request.user._id;
    const { id: circleId } = request.params;
    const { limit = 20, page = 1 } = request.query;
    
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

        // Get files directly shared with the circle
        const objectIdCircleId = new ObjectId(String(circleId));
        
        // Simple, clear query to find files shared with this circle
        const sharedFiles = await filesCollection.find({
            // Simply check if the circle ID is in the circleIds array
            circleIds: objectIdCircleId
        }).sort({ uploadedAt: -1 }).toArray();
        
        console.log(`Found ${sharedFiles.length} files shared with circle ${circleId}`);

        // Get albums shared with the circle
        const sharedAlbums = await albumsCollection.find({
            // Simply check if the circle ID is in the circleIds array
            circleIds: objectIdCircleId
        }).sort({ updatedAt: -1 }).toArray();
        
        console.log(`Found ${sharedAlbums.length} albums shared with circle ${circleId}`);

        // For each album, get the latest 4 files to preview
        for (const album of sharedAlbums) {
            // Get files that reference this album
            const albumFiles = await filesCollection.find({
                userId: album.userId,
                albums: album._id  // Files reference albums in their 'albums' array
            }).sort({ uploadedAt: -1 }).limit(4).toArray();
            
            album.previewFiles = albumFiles.map(file => ({
                id: file._id.toString(),
                thumbnailId: file._id.toString(),
                originalName: file.originalName,
                mimetype: file.mimetype,
                size: file.size,
                createdAt: file.createdAt,
                uploadedAt: file.uploadedAt
            }));
        }

        // Create timeline items
        const timelineItems = [];

        // Add shared files to timeline
        sharedFiles.forEach(file => {
            // Skip if file doesn't have necessary properties
            if (!file || !file._id || !file.userId) {
                console.log('Skipping invalid file:', file);
                return;
            }

            // Make sure we have a valid owner
            const fileUserId = file.userId.toString();
            const owner = userMap[fileUserId] || { 
                id: fileUserId,
                name: 'Unknown User',
                picture: null
            };

            timelineItems.push({
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
                timestamp: file.uploadedAt?.getTime() || file.createdAt?.getTime() || new Date().getTime()
            });
        });

        // Add shared albums to timeline
        for (const album of sharedAlbums) {
            // Skip if album doesn't have necessary properties
            if (!album || !album._id || !album.userId) {
                console.log('Skipping invalid album:', album);
                continue;
            }

            // Make sure we have a valid owner
            const albumUserId = album.userId.toString();
            const owner = userMap[albumUserId] || { 
                id: albumUserId,
                name: 'Unknown User',
                picture: null
            };

            // Get the file count for this album
            const fileCount = await filesCollection.countDocuments({
                userId: album.userId,
                albums: album._id
            });

            timelineItems.push({
                type: 'album',
                id: album._id.toString(),
                ownerId: albumUserId,
                owner: owner,
                item: {
                    id: album._id.toString(),
                    name: album.name || 'Unnamed album',
                    description: album.description || '',
                    fileCount: fileCount,
                    thumbnailId: album.thumbnailId || (album.previewFiles && album.previewFiles.length > 0 ? album.previewFiles[0].id : null),
                    previewFiles: album.previewFiles || []
                },
                createdAt: album.createdAt || new Date(),
                updatedAt: album.updatedAt || album.createdAt || new Date(),
                timestamp: getAlbumTimestamp(album)
            });
        }

        // Sort timeline items by timestamp (newest first)
        timelineItems.sort((a, b) => b.timestamp - a.timestamp);
        
        console.log(`Total timeline items before grouping: ${timelineItems.length}`);

        // Group consecutive items by owner
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

        // Apply pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const paginatedTimeline = groupedTimeline.slice(skip, skip + parseInt(limit));

        return {
            timeline: paginatedTimeline,
            totalItems: groupedTimeline.length,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(groupedTimeline.length / parseInt(limit))
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