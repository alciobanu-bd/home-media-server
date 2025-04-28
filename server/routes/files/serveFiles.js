const path = require('path');
const { uploadDir, thumbnailsDir } = require('../utils/fileHelpers');

/**
 * Route handler for serving media files
 * GET /api/media/file/:filename
 */
const serveMediaFileHandler = (req, reply) => {
    const { filename } = req.params;
    reply.sendFile(filename, uploadDir);
};

/**
 * Route handler for serving thumbnail files
 * GET /api/thumbnails/:filename
 */
const serveThumbnailHandler = (req, reply) => {
    const { filename } = req.params;
    reply.sendFile(filename, thumbnailsDir);
};

module.exports = function(fastify, opts, done) {
    fastify.get('/media/file/:filename', serveMediaFileHandler);
    fastify.get('/thumbnails/:filename', serveThumbnailHandler);
    done();
}; 