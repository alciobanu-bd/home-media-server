/**
 * Main routes index file
 * Registers all route modules with the Fastify instance
 */
const mediaListRoute = require('./media/listMedia');
const mediaItemRoute = require('./media/getMediaItem');
const metadataRoute = require('./media/getMetadata');
const serveFilesRoute = require('./files/serveFiles');
const uploadFileRoute = require('./files/uploadFile');
const deleteFileRoute = require('./files/deleteFile');

module.exports = function(fastify, opts, done) {
  // Register route modules with /api prefix
  fastify.register(mediaListRoute, { prefix: '/api' });
  fastify.register(mediaItemRoute, { prefix: '/api' });
  fastify.register(metadataRoute, { prefix: '/api' });
  fastify.register(serveFilesRoute, { prefix: '/api' });
  fastify.register(uploadFileRoute, { prefix: '/api' });
  fastify.register(deleteFileRoute, { prefix: '/api' });
  
  done();
}; 