const path = require('path');
const fs = require('fs-extra');
const { ObjectId } = require('mongodb');
const { getDb, getCollection } = require('../utils/db');
const { verifyToken } = require('../auth/authMiddleware');
const {
    getDefaultTier,
    hasEnoughStorageQuota,
    getMediaQualitySettings
} = require('../utils/subscriptionTiers');

const {
    uploadDir,
    extractMetadata,
    generateThumbnail,
    calculateMD5,
    findDuplicateFile,
    processMediaForStorage
} = require('../utils/fileHelpers');

/**
 * Route handler for uploading a file
 * POST /api/upload
 */
const uploadFileHandler = async (request, reply) => {
    const data = await request.file();

    if (!data) {
        return reply.code(400).send({ error: 'No file provided' });
    }

    // Check if user is authenticated
    if (!request.user) {
        return reply.code(401).send({ 
            error: 'Unauthorized',
            message: 'Authentication required'
        });
    }
  
    // Get userId from request
    const userId = request.user._id;
  
    const fileType = data.mimetype;
  
    // Check if file type is allowed
    if (!fileType.startsWith('image/') && !fileType.startsWith('video/')) {
        return reply.code(400).send({ error: 'Only image and video files are allowed' });
    }
  
    try {
        const db = getDb();
        
        // Get user's subscription tier
        const userTier = request.user.subscriptionTier || getDefaultTier();
        
        // Check file size against storage quota
        const fileSize = data.file.bytesRead;
        
        // Get user's current storage usage
        const filesCollection = getCollection(db, 'files');
        const quotaStats = await filesCollection.aggregate([
            { $match: { userId } },
            { $group: { _id: null, totalSize: { $sum: '$size' } } }
        ]).toArray();
        
        const currentUsage = quotaStats.length > 0 ? quotaStats[0].totalSize : 0;
        
        // Check if user has enough storage quota
        if (!hasEnoughStorageQuota(currentUsage, fileSize, userTier)) {
            return reply.code(400).send({
                error: 'Storage quota exceeded',
                message: 'You have reached your storage limit. Please upgrade your subscription or remove some files.'
            });
        }
    
        // Create temporary file for processing
        const tempPath = path.join(uploadDir, 'temp-' + data.filename);
        await fs.writeFile(tempPath, await data.toBuffer());
    
        // Calculate MD5 hash of the file
        const md5Hash = await calculateMD5(tempPath);
        console.log(`MD5 hash for ${data.filename}: ${md5Hash}`);
    
        // Check for duplicate files - include userId to check duplicates per user
        const duplicateFile = await findDuplicateFile(md5Hash, userId);
    
        if (duplicateFile) {
            // Clean up temp file
            await fs.remove(tempPath);
      
            console.log(`Duplicate file detected: ${data.filename} matches ${duplicateFile.originalName}`);
      
            // Return the existing file info with duplicate flag
            return { 
                id: duplicateFile._id.toString(),
                originalName: duplicateFile.originalName,
                success: true,
                duplicate: true,
                message: 'File already exists in the system'
            };
        }
    
        // Extract metadata to get creation date
        const metadata = await extractMetadata(tempPath, fileType);
    
        // Create ObjectId based on creation date if available
        const fileId = new ObjectId(
            Math.floor(metadata.createdAt.getTime() / 1000).toString(16) + 
            Array.from({length: 16}, () => Math.floor(Math.random() * 16).toString(16)).join('')
        );
    
        // Save file with ObjectId as filename
        const fileExtension = path.extname(data.filename);
        const savedFilename = `${fileId}${fileExtension}`;
        const finalPath = path.join(uploadDir, savedFilename);
        
        // Get media quality settings based on the user's tier
        const mediaType = fileType.startsWith('image/') ? 'photo' : 'video';
        const qualitySettings = getMediaQualitySettings(userTier, mediaType);
        
        // Process media file according to tier settings
        await processMediaForStorage(tempPath, finalPath, fileType, qualitySettings);
        
        // Update file size after processing (might be different from original)
        const processedFileStats = await fs.stat(finalPath);
        const processedFileSize = processedFileStats.size;
    
        // Generate thumbnail
        await generateThumbnail(finalPath, fileType, fileId);
    
        // Store file info in database
        await filesCollection.insertOne({
            _id: fileId,
            originalName: data.filename,
            filename: savedFilename,
            type: fileType,
            size: processedFileSize, // Use processed file size
            originalSize: fileSize, // Store original size for reference
            md5Hash: md5Hash, // Store the MD5 hash for future duplicate checks
            createdAt: metadata.createdAt,
            uploadedAt: new Date(),
            userId: userId, // Add userId to the file document
            processedWithTier: userTier // Record which tier was used for processing
        });
    
        // Store metadata
        const metadataCollection = getCollection(db, 'metadata');
        await metadataCollection.insertOne({
            file_id: fileId,
            userId: userId, // Add userId to metadata
            ...metadata
        });
    
        // Store thumbnail info
        const thumbnailsCollection = getCollection(db, 'thumbnails');
        await thumbnailsCollection.insertOne({
            file_id: fileId,
            filename: `${fileId}.jpg`,
            userId: userId, // Add userId to thumbnail record
            createdAt: new Date()
        });
    
        return { 
            id: fileId.toString(),
            userId: userId,
            success: true,
            duplicate: false
        };
    } catch (err) {
        console.error('Upload error:', err);
        return reply.code(500).send({ 
            error: 'Failed to process upload',
            details: err.message
        });
    }
};

module.exports = function(fastify, opts, done) {
    fastify.post('/upload', {
        preHandler: verifyToken
    }, uploadFileHandler);
    done();
}; 