import api from './api';

/**
 * Service for managing Trusted Circles (user groups)
 */
const circlesService = {
  /**
   * Get all circles for the current user
   * @returns {Promise} Promise object with circles data
   */
  getUserCircles: async () => {
    try {
      const response = await api.get('/circles');
      return response.data;
    } catch (error) {
      console.error('Error fetching circles:', error);
      throw error;
    }
  },

  /**
   * Get details about a specific circle
   * @param {string} id Circle ID
   * @returns {Promise} Promise object with circle details
   */
  getCircleById: async (id) => {
    try {
      const response = await api.get(`/circles/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching circle ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new circle
   * @param {Object} circleData Circle data with name and description
   * @returns {Promise} Promise object with new circle details
   */
  createCircle: async (circleData) => {
    try {
      const response = await api.post('/circles', circleData);
      return response.data;
    } catch (error) {
      console.error('Error creating circle:', error);
      throw error;
    }
  },

  /**
   * Update an existing circle
   * @param {string} id Circle ID
   * @param {Object} updateData Circle data to update (name, description)
   * @returns {Promise} Promise object with updated circle details
   */
  updateCircle: async (id, updateData) => {
    try {
      const response = await api.put(`/circles/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating circle:', error);
      throw error;
    }
  },

  /**
   * Invite a user to a circle by email
   * @param {string} id Circle ID
   * @param {string} email Email address to invite
   * @returns {Promise} Promise object with invitation result
   */
  inviteUser: async (id, email) => {
    try {
      const response = await api.post(`/circles/${id}/invite`, { email });
      return response.data;
    } catch (error) {
      console.error('Error inviting user:', error);
      throw error;
    }
  },

  /**
   * Accept a circle invitation
   * @param {string} token Invitation token
   * @returns {Promise} Promise object with acceptance result
   */
  acceptInvitation: async (token) => {
    try {
      const response = await api.post(`/circles/invitations/${token}/accept`);
      return response.data;
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  },

  /**
   * Get all pending circle invitations for the current user
   * @returns {Promise} Promise object with invitations data
   */
  getUserInvitations: async () => {
    try {
      const response = await api.get('/circles/invitations');
      return response.data;
    } catch (error) {
      console.error('Error fetching invitations:', error);
      throw error;
    }
  },

  /**
   * Decline a circle invitation
   * @param {string} token Invitation token
   * @returns {Promise} Promise object with decline result
   */
  declineInvitation: async (token) => {
    try {
      const response = await api.delete(`/circles/invitations/${token}`);
      return response.data;
    } catch (error) {
      console.error('Error declining invitation:', error);
      throw error;
    }
  },

  /**
   * Make a user an admin of a circle
   * @param {string} circleId Circle ID
   * @param {string} userId User ID to make admin
   * @returns {Promise} Promise object with result
   */
  makeAdmin: async (circleId, userId) => {
    try {
      const response = await api.post(`/circles/${circleId}/make-admin`, { userId });
      return response.data;
    } catch (error) {
      console.error('Error making user admin:', error);
      throw error;
    }
  },

  /**
   * Remove a user from a circle
   * @param {string} circleId Circle ID
   * @param {string} userId User ID to remove
   * @returns {Promise} Promise object with result
   */
  removeUser: async (circleId, userId) => {
    try {
      const response = await api.delete(`/circles/${circleId}/members/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing user:', error);
      throw error;
    }
  },

  /**
   * Delete a circle
   * @param {string} id Circle ID
   * @returns {Promise} Promise object with deletion result
   */
  deleteCircle: async (id) => {
    try {
      const response = await api.delete(`/circles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting circle:', error);
      throw error;
    }
  },

  /**
   * Get all files shared with a circle
   * @param {string} id Circle ID
   * @returns {Promise} Promise object with shared files
   */
  getCircleSharedFiles: async (id) => {
    try {
      const response = await api.get(`/circles/${id}/files`);
      return response.data.files;
    } catch (error) {
      console.error('Error fetching shared files:', error);
      throw error;
    }
  }
};

export default circlesService; 