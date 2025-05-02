const listAlbums = require('./listAlbums');
const createAlbum = require('./createAlbum');
const getAlbum = require('./getAlbum');
const getAlbumFiles = require('./getAlbumFiles');
const updateAlbum = require('./updateAlbum');
const deleteAlbum = require('./deleteAlbum');
const addMediaToAlbum = require('./addMediaToAlbum');
const removeMediaFromAlbum = require('./removeMediaFromAlbum');
const updateAlbumThumbnail = require('./updateAlbumThumbnail');
const shareAlbum = require('./shareAlbum');

module.exports = function(fastify, opts, done) {
    // Register each route handler
    listAlbums(fastify, opts, ()=>{});
    createAlbum(fastify, opts, ()=>{});
    getAlbum(fastify, opts, ()=>{});
    getAlbumFiles(fastify, opts, ()=>{});
    updateAlbum(fastify, opts, ()=>{});
    deleteAlbum(fastify, opts, ()=>{});
    addMediaToAlbum(fastify, opts, ()=>{});
    removeMediaFromAlbum(fastify, opts, ()=>{});
    updateAlbumThumbnail(fastify, opts, ()=>{});
    shareAlbum(fastify, opts, ()=>{});
    
    done();
}; 