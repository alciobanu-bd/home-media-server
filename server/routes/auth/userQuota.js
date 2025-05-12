const { getDb, getCollection } = require('../utils/db');
const { verifyToken } = require('./authMiddleware');
const { 
    getTierConfig, 
    getDefaultTier, 
    getStorageLimit,
    formatStorageSize,
    getFormattedStorageLimit 
} = require('../utils/subscriptionTiers');

/**
 * Get user's storage quota and usage information
 * GET /api/user/quota
 */
const getUserQuota = async (request, reply) => {
    // Check if user is authenticated
    if (!request.user) {
        return reply.code(401).send({
            error: 'Unauthorized',
            message: 'Authentication required'
        });
    }

    try {
        const db = getDb();
        const userId = request.user._id;
        
        // Get the user's subscription tier (default to 'lite' if not set)
        const userTier = request.user.subscriptionTier || getDefaultTier();
        const tierConfig = getTierConfig(userTier);

        // Get the storage limit for this tier
        const storageLimit = getStorageLimit(userTier);
        const formattedStorageLimit = getFormattedStorageLimit(userTier);

        // Get the files collection
        const filesCollection = getCollection(db, 'files');

        // Use MongoDB aggregation to calculate total size and count
        const quotaStats = await filesCollection.aggregate([
            // Match files belonging to this user
            { $match: { userId: userId } },
            // Group and calculate total size and count
            { 
                $group: { 
                    _id: null, 
                    totalSize: { $sum: '$size' }, 
                    totalFiles: { $count: {} } 
                } 
            }
        ]).toArray();

        // If user has no files, return zero values
        if (quotaStats.length === 0) {
            return {
                totalSize: 0,
                totalSizeFormatted: '0 B',
                totalFiles: 0,
                subscriptionTier: userTier,
                tierName: tierConfig.name,
                storageLimit: storageLimit,
                storageLimitFormatted: formattedStorageLimit,
                usagePercentage: 0
            };
        }

        const { totalSize, totalFiles } = quotaStats[0];
        
        // Format the size in a human-readable format
        const formattedSize = formatFileSize(totalSize);
        
        // Calculate usage percentage
        const usagePercentage = Math.min(100, Math.round((totalSize / storageLimit) * 100));

        return {
            totalSize,
            totalSizeFormatted: formattedSize,
            totalFiles,
            subscriptionTier: userTier,
            tierName: tierConfig.name,
            storageLimit: storageLimit,
            storageLimitFormatted: formattedStorageLimit,
            usagePercentage
        };
    } catch (err) {
        console.error('Error getting user quota:', err);
        return reply.code(500).send({
            error: 'Failed to retrieve quota information',
            details: err.message
        });
    }
};

/**
 * Format file size into a human-readable string
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + units[i];
}

module.exports = function(fastify, opts, done) {
    fastify.get('/user/quota', {
        preHandler: verifyToken
    }, getUserQuota);
    done();
}; 