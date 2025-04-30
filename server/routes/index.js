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
const authRoutes = require('./auth');
// Add user quota route
const userQuotaRoute = require('./auth/userQuota');
// Add album routes
const createAlbumRoute = require('./albums/createAlbum');
const listAlbumsRoute = require('./albums/listAlbums');
const getAlbumRoute = require('./albums/getAlbum');
const updateAlbumRoute = require('./albums/updateAlbum');
const updateAlbumThumbnailRoute = require('./albums/updateAlbumThumbnail');
const deleteAlbumRoute = require('./albums/deleteAlbum');
const addMediaToAlbumRoute = require('./albums/addMediaToAlbum');
const removeMediaFromAlbumRoute = require('./albums/removeMediaFromAlbum');
const getAlbumFilesRoute = require('./albums/getAlbumFiles');

module.exports = function(fastify, opts, done) {
    // Register route modules with /api prefix
    fastify.register(mediaListRoute, { prefix: '/api' });
    fastify.register(mediaItemRoute, { prefix: '/api' });
    fastify.register(metadataRoute, { prefix: '/api' });
    fastify.register(serveFilesRoute, { prefix: '/api' });
    fastify.register(uploadFileRoute, { prefix: '/api' });
    fastify.register(deleteFileRoute, { prefix: '/api' });
  
    // Register auth routes with /api prefix
    fastify.register(authRoutes, { prefix: '/api' });
    
    // Register user quota route with /api prefix
    fastify.register(userQuotaRoute, { prefix: '/api' });
    
    // Register album routes with /api prefix
    fastify.register(createAlbumRoute, { prefix: '/api' });
    fastify.register(listAlbumsRoute, { prefix: '/api' });
    fastify.register(getAlbumRoute, { prefix: '/api' });
    fastify.register(updateAlbumRoute, { prefix: '/api' });
    fastify.register(updateAlbumThumbnailRoute, { prefix: '/api' });
    fastify.register(deleteAlbumRoute, { prefix: '/api' });
    fastify.register(addMediaToAlbumRoute, { prefix: '/api' });
    fastify.register(removeMediaFromAlbumRoute, { prefix: '/api' });
    fastify.register(getAlbumFilesRoute, { prefix: '/api' });
  
    done();
}; 