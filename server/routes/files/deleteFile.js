const path = require('path');
const fs = require('fs-extra');
const { ObjectId } = require('mongodb');
const { getDb, getCollection } = require('../utils/db');
const { uploadDir, thumbnailsDir } = require('../utils/fileHelpers');

/**
 * Route handler for deleting a file
 * DELETE /api/:file_id
 */
const deleteFileHandler = async (request, reply) => {
  const { file_id } = request.params;
  const db = getDb();
  
  try {
    const fileId = new ObjectId(file_id);
    
    // Get file information
    const filesCollection = getCollection(db, 'files');
    const file = await filesCollection.findOne({ _id: fileId });
    
    if (!file) {
      return reply.code(404).send({ error: 'File not found' });
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
  fastify.delete('/:file_id', deleteFileHandler);
  done();
}; 