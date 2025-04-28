const path = require('path');
const fs = require('fs-extra');
const { ObjectId } = require('mongodb');
const { getDb, getCollection } = require('../utils/db');
const { verifyToken } = require('../auth/authMiddleware');

const {
    uploadDir,
    extractMetadata,
    generateThumbnail,
    calculateMD5,
    findDuplicateFile
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
    
        await fs.move(tempPath, finalPath, { overwrite: true });
    
        // Generate thumbnail
        await generateThumbnail(finalPath, fileType, fileId);
    
        // Store file info in database
        const filesCollection = getCollection(db, 'files');
        await filesCollection.insertOne({
            _id: fileId,
            originalName: data.filename,
            filename: savedFilename,
            type: fileType,
            size: data.file.bytesRead,
            md5Hash: md5Hash, // Store the MD5 hash for future duplicate checks
            createdAt: metadata.createdAt,
            uploadedAt: new Date(),
            userId: userId // Add userId to the file document
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