const path = require('path');
const fs = require('fs-extra');
const { ObjectId } = require('mongodb');
const { getDb, getCollection } = require('../utils/db');
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
    
    // Check for duplicate files
    const duplicateFile = await findDuplicateFile(md5Hash);
    
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
      Math.floor(metadata.createdAt.getTime() / 1000).toString(16) + '0000000000000000'
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
      uploadedAt: new Date()
    });
    
    // Store metadata
    const metadataCollection = getCollection(db, 'metadata');
    await metadataCollection.insertOne({
      file_id: fileId,
      ...metadata
    });
    
    // Store thumbnail info
    const thumbnailsCollection = getCollection(db, 'thumbnails');
    await thumbnailsCollection.insertOne({
      file_id: fileId,
      filename: `${fileId}.jpg`,
      createdAt: new Date()
    });
    
    return { 
      id: fileId.toString(),
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
  fastify.post('/upload', uploadFileHandler);
  done();
}; 