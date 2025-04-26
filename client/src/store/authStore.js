import { reactive, readonly } from 'vue';
import { getCurrentUser, logout as logoutApi, redirectToGoogleLogin } from '../services/auth';

// Create a reactive state
const state = reactive({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
});

// Actions
const actions = {
  /**
   * Check if user is authenticated and load user data
   */
  async checkAuth() {
    // Don't check again if already loading
    if (state.isLoading) return;
    
    state.isLoading = true;
    state.error = null;
    
    try {
      const user = await getCurrentUser();
      
      if (user && user.id) {
        state.user = user;
        state.isAuthenticated = true;
        console.log('Authentication successful:', user);
      } else {
        state.user = null;
        state.isAuthenticated = false;
        console.log('Not authenticated');
      }
    } catch (error) {
      state.error = 'Failed to check authentication status';
      state.user = null;
      state.isAuthenticated = false;
      console.error('Auth check error:', error);
    } finally {
      state.isLoading = false;
    }
  },
  
  /**
   * Login with Google
   */
  loginWithGoogle() {
    redirectToGoogleLogin();
  },
  
  /**
   * Logout the current user
   */
  async logout() {
    state.isLoading = true;
    state.error = null;
    
    try {
      const success = await logoutApi();
      
      if (success) {
        state.user = null;
        state.isAuthenticated = false;
      } else {
        state.error = 'Failed to logout';
      }
    } catch (error) {
      state.error = 'Failed to logout';
      console.error(error);
    } finally {
      state.isLoading = false;
    }
  }
};

// Export readonly state and actions
export default {
  state: readonly(state),
  ...actions
}; 