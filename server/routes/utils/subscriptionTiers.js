/**
 * Subscription tiers utility module
 * Defines subscription tiers and provides helper functions for tier-based operations
 */

// Define subscription tiers
const SUBSCRIPTION_TIERS = {
    LITE: 'lite',
    GLOW: 'glow',
    AURORA: 'aurora'
};

// Define tier limits and features
const TIER_CONFIG = {
    [SUBSCRIPTION_TIERS.LITE]: {
        name: 'Lumia Lite',
        description: 'Your first step into organized memories',
        storageLimit: 2 * 1024 * 1024 * 1024, // 2GB in bytes
        mediaQuality: {
            photo: {
                maxResolution: 1080, // max height/width in pixels
                maintainAspectRatio: true,
                compressionLevel: 'medium' // low, medium, high
            },
            video: {
                maxResolution: 720, // 720p
                maxFPS: 30,
                maintainOriginalFramerate: false
            }
        }
    },
    [SUBSCRIPTION_TIERS.GLOW]: {
        name: 'Lumia Glow',
        description: 'Enhanced clarity for your growing collection',
        storageLimit: 20 * 1024 * 1024 * 1024, // 20GB in bytes
        mediaQuality: {
            photo: {
                maxResolution: 4000, // Up to 12MP (approx 4000x3000)
                maintainAspectRatio: true,
                compressionLevel: 'low' // low, medium, high
            },
            video: {
                maxResolution: 1080, // 1080p
                maxFPS: null, // No limit, preserve original
                maintainOriginalFramerate: true
            }
        }
    },
    [SUBSCRIPTION_TIERS.AURORA]: {
        name: 'Lumia Aurora',
        description: 'Brilliant, uncompromised family memories',
        storageLimit: 100 * 1024 * 1024 * 1024, // 100GB in bytes
        mediaQuality: {
            photo: {
                maxResolution: null, // No limit, preserve original
                maintainAspectRatio: true,
                compressionLevel: 'none' // no compression
            },
            video: {
                maxResolution: null, // No limit, preserve original
                maxFPS: null, // No limit, preserve original
                maintainOriginalFramerate: true
            }
        }
    }
};

/**
 * Get the default subscription tier for new users
 * @returns {string} Default subscription tier
 */
function getDefaultTier() {
    return SUBSCRIPTION_TIERS.LITE;
}

/**
 * Get configuration for a specific tier
 * @param {string} tier - Tier name
 * @returns {Object} Tier configuration
 */
function getTierConfig(tier) {
    return TIER_CONFIG[tier] || TIER_CONFIG[SUBSCRIPTION_TIERS.LITE];
}

/**
 * Check if user has enough storage quota remaining
 * @param {number} userUsedStorage - Current used storage in bytes
 * @param {number} fileSize - File size to be uploaded in bytes
 * @param {string} userTier - User's subscription tier
 * @returns {boolean} True if user has enough storage quota
 */
function hasEnoughStorageQuota(userUsedStorage, fileSize, userTier) {
    const tierConfig = getTierConfig(userTier);
    return userUsedStorage + fileSize <= tierConfig.storageLimit;
}

/**
 * Get the storage limit for a tier
 * @param {string} tier - Subscription tier
 * @returns {number} Storage limit in bytes
 */
function getStorageLimit(tier) {
    const tierConfig = getTierConfig(tier);
    return tierConfig.storageLimit;
}

/**
 * Get the media quality settings for a tier
 * @param {string} tier - Subscription tier
 * @param {string} mediaType - 'photo' or 'video'
 * @returns {Object} Media quality settings
 */
function getMediaQualitySettings(tier, mediaType) {
    const tierConfig = getTierConfig(tier);
    return tierConfig.mediaQuality[mediaType];
}

/**
 * Format bytes to human-readable size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size (e.g., "2.5 GB")
 */
function formatStorageSize(bytes) {
    if (bytes === 0) return '0 Bytes';
  
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
  
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get formatted storage limit for a tier
 * @param {string} tier - Subscription tier
 * @returns {string} Formatted storage limit
 */
function getFormattedStorageLimit(tier) {
    return formatStorageSize(getStorageLimit(tier));
}

/**
 * Get all available subscription tiers
 * @returns {Object} All subscription tiers
 */
function getAllTiers() {
    return SUBSCRIPTION_TIERS;
}

/**
 * Get full configuration for all tiers
 * @returns {Object} Configuration for all tiers
 */
function getAllTierConfigs() {
    return TIER_CONFIG;
}

module.exports = {
    SUBSCRIPTION_TIERS,
    getDefaultTier,
    getTierConfig,
    hasEnoughStorageQuota,
    getStorageLimit,
    getMediaQualitySettings,
    formatStorageSize,
    getFormattedStorageLimit,
    getAllTiers,
    getAllTierConfigs
};
