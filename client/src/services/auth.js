/**
 * Authentication service for Google OAuth
 */

const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api';

/**
 * Get the current authenticated user
 * @returns {Promise<Object>} User data or null if not authenticated
 */
export async function getCurrentUser() {
  try {
    console.log('Fetching current user from:', `${API_URL}/auth/me`);
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      credentials: 'include', // Important for cookies
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const userData = await response.json();
      console.log('User data received:', userData);
      return userData;
    }
    
    console.log('Not authenticated, status:', response.status);
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Logout the current user
 * @returns {Promise<boolean>} Success status
 */
export async function logout() {
  try {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include', // Important for cookies
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error logging out:', error);
    return false;
  }
}

/**
 * Redirect to Google OAuth login page
 */
export function redirectToGoogleLogin() {
  window.location.href = `${API_URL}/auth/google/init`;
} 