const path = require('path');
const fs = require('fs-extra');
const { ObjectId } = require('mongodb');
const { getDb, getCollection } = require('../utils/db');
const { uploadDir, thumbnailsDir } = require('../utils/fileHelpers');
const { verifyToken } = require('../auth/authMiddleware');

/**
 * Route handler for deleting a file
 * DELETE /api/:file_id
 */
const deleteFileHandler = async (request, reply) => {
  const { file_id } = request.params;
  
  // Check if user is authenticated
  if (!request.user) {
    return reply.code(401).send({ 
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }

  const userId = request.user._id;
  const db = getDb();
  
  try {
    const fileId = new ObjectId(file_id);
    
    // Get file information
    const filesCollection = getCollection(db, 'files');
    const file = await filesCollection.findOne({ _id: fileId });
    
    if (!file) {
      return reply.code(404).send({ error: 'File not found' });
    }
    
    // Check if the file belongs to the authenticated user
    if (!file.userId || file.userId.toString() !== userId.toString()) {
      return reply.code(403).send({ 
        error: 'Forbidden',
        message: 'You do not have permission to delete this file'
      });
    }
    
    // Delete file from disk
    const filePath = path.join(uploadDir, file.filename);
    await fs.remove(filePath);
    
    // Delete thumbnail from disk
    const thumbnailPath = path.join(thumbnailsDir, `${file_id}.jpg`);
    await fs.remove(thumbnailPath);
    
    // Delete from database
    await filesCollection.deleteOne({ _id: fileId });
    
    const thumbnailsCollection = getCollection(db, 'thumbnails');
    await thumbnailsCollection.deleteOne({ file_id: fileId });
    
    const metadataCollection = getCollection(db, 'metadata');
    await metadataCollection.deleteOne({ file_id: fileId });
    
    return { success: true };
  } catch (err) {
    console.error('Delete error:', err);
    return reply.code(500).send({ 
      error: 'Failed to delete file',
      details: err.message
    });
  }
};

module.exports = function(fastify, opts, done) {
  fastify.delete('/:file_id', { preHandler: verifyToken }, deleteFileHandler);
  done();
}; 