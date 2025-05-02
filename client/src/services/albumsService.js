import api from './api';

/**
 * Service for managing Albums 
 */
const albumsService = {
  /**
   * Get all albums for the current user
   * @returns {Promise} Promise with albums data
   */
  getAlbums: async () => {
    try {
      const response = await api.get('/albums');
      return response.data;
    } catch (error) {
      console.error('Error fetching albums:', error);
      throw error;
    }
  },

  /**
   * Get a specific album by ID
   * @param {string} id - Album ID
   * @returns {Promise} Promise with album details
   */
  getAlbumById: async (id) => {
    try {
      const response = await api.get(`/albums/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching album ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Get files in an album
   * @param {string} id - Album ID
   * @returns {Promise} Promise with album files
   */
  getAlbumFiles: async (id) => {
    try {
      const response = await api.get(`/albums/${id}/files`);
      return response.data.files;
    } catch (error) {
      console.error(`Error fetching album files for ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Create a new album
   * @param {string} name - Album name
   * @returns {Promise} Promise with new album details
   */
  createAlbum: async (name) => {
    try {
      const response = await api.post('/albums', { name });
      return response.data;
    } catch (error) {
      console.error('Error creating album:', error);
      throw error;
    }
  },
  
  /**
   * Update an album
   * @param {string} id - Album ID
   * @param {string} name - New album name
   * @returns {Promise} Promise with updated album
   */
  updateAlbum: async (id, name) => {
    try {
      const response = await api.put(`/albums/${id}`, { name });
      return response.data;
    } catch (error) {
      console.error(`Error updating album ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete an album
   * @param {string} id - Album ID
   * @returns {Promise} Promise with deletion result
   */
  deleteAlbum: async (id) => {
    try {
      const response = await api.delete(`/albums/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting album ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Add media to an album
   * @param {string} albumId - Album ID
   * @param {Array<string>} mediaIds - Media IDs to add
   * @returns {Promise} Promise with result
   */
  addMediaToAlbum: async (albumId, mediaIds) => {
    try {
      const response = await api.post(`/albums/${albumId}/media`, { mediaIds });
      return response.data;
    } catch (error) {
      console.error(`Error adding media to album ${albumId}:`, error);
      throw error;
    }
  },
  
  /**
   * Remove media from an album
   * @param {string} albumId - Album ID
   * @param {string} mediaId - Media ID to remove
   * @returns {Promise} Promise with result
   */
  removeMediaFromAlbum: async (albumId, mediaId) => {
    try {
      const response = await api.delete(`/albums/${albumId}/media/${mediaId}`);
      return response.data;
    } catch (error) {
      console.error(`Error removing media from album ${albumId}:`, error);
      throw error;
    }
  },
  
  /**
   * Share an album with circles
   * @param {string} albumId - Album ID
   * @param {Array<string>} circleIds - Circle IDs to share with
   * @returns {Promise} Promise with result
   */
  shareAlbumWithCircles: async (albumId, circleIds) => {
    try {
      const response = await api.put(`/albums/${albumId}/share`, { circleIds });
      return response.data;
    } catch (error) {
      console.error(`Error sharing album ${albumId} with circles:`, error);
      throw error;
    }
  },
  
  /**
   * Get all albums shared with a specific circle
   * @param {string} circleId - Circle ID
   * @returns {Promise} Promise with shared albums
   */
  getAlbumsSharedWithCircle: async (circleId) => {
    try {
      const response = await api.get(`/circles/${circleId}/albums`);
      return response.data.albums || [];
    } catch (error) {
      console.error(`Error fetching albums shared with circle ${circleId}:`, error);
      throw error;
    }
  }
};

export default albumsService; 