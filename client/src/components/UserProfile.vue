<template>
  <div class="user-profile" v-if="authStore.state.isAuthenticated">
    <div class="profile-container" @click.stop="toggleDropdown">
      <img 
        :src="authStore.state.user.picture" 
        alt="Profile" 
        class="profile-picture"
      />
      <div class="user-info">
        <span class="user-name">{{ authStore.state.user.name }}</span>
        <span class="user-email">{{ authStore.state.user.email }}</span>
      </div>
      <span class="dropdown-icon">▼</span>
    </div>
    
    <div class="dropdown-menu" :class="{ visible: showDropdown }" v-show="showDropdown" ref="dropdown">
      <div class="dropdown-header">
        <img 
          :src="authStore.state.user.picture" 
          alt="Profile" 
          class="dropdown-profile-picture"
        />
        <div class="dropdown-user-info">
          <div class="dropdown-user-name">{{ authStore.state.user.name }}</div>
          <div class="dropdown-user-email">{{ authStore.state.user.email }}</div>
        </div>
      </div>
      <div class="dropdown-divider"></div>
      <button class="logout-button" @click="logout">
        <span class="logout-icon">⎋</span>
        Logout
      </button>
    </div>
  </div>
  <div class="login-button" v-else>
    <button class="primary-button" @click="authStore.loginWithGoogle">
      Sign in
    </button>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import authStore from '../store/authStore';

export default {
  name: 'UserProfile',
  setup() {
    const showDropdown = ref(false);
    const dropdown = ref(null);
    
    const toggleDropdown = () => {
      showDropdown.value = !showDropdown.value;
      
      // If opening the dropdown, add a one-time event listener to close on next click
      if (showDropdown.value) {
        setTimeout(() => {
          window.addEventListener('click', closeDropdownOnce);
        }, 0);
      }
    };
    
    const closeDropdownOnce = (event) => {
      // Remove the one-time event listener
      window.removeEventListener('click', closeDropdownOnce);
      
      // Close the dropdown if the click is outside the dropdown
      if (dropdown.value && !dropdown.value.contains(event.target)) {
        showDropdown.value = false;
      }
    };
    
    const logout = async () => {
      try {
        const success = await authStore.logout();
        if (success) {
          showDropdown.value = false;
        } else {
          console.error('Logout failed:', authStore.state.error);
          alert(`Logout failed: ${authStore.state.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Logout error:', error);
        alert(`Logout error: ${error.message || 'Unknown error'}`);
      }
    };
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdown.value && 
          !dropdown.value.contains(event.target) && 
          showDropdown.value &&
          !event.target.closest('.profile-container')) {
        showDropdown.value = false;
      }
    };
    
    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
    });
    
    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('click', closeDropdownOnce);
    });
    
    return {
      authStore,
      showDropdown,
      dropdown,
      toggleDropdown,
      logout
    };
  }
};
</script>

<style scoped>
.user-profile {
  position: relative;
  display: inline-block;
}

.profile-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 24px;
  transition: all var(--transition-speed) ease;
  background-color: var(--color-hover, rgba(0,0,0,0.05));
}

.profile-container:hover {
  background-color: var(--color-hover-dark, rgba(0,0,0,0.1));
  transform: translateY(-1px);
}

.profile-container:active {
  transform: translateY(0);
}

.profile-picture {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid transparent;
  transition: all var(--transition-speed) ease;
}

.profile-container:hover .profile-picture {
  border-color: var(--color-primary-light);
}

.user-info {
  display: flex;
  flex-direction: column;
  margin: 0 8px;
  overflow: hidden;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.user-email {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.dropdown-icon {
  font-size: 10px;
  color: var(--color-text-secondary);
  margin-left: 4px;
  transition: transform var(--transition-speed) ease;
}

.profile-container:hover .dropdown-icon {
  transform: translateY(2px);
}

.dropdown-menu {
  position: absolute;
  top: 52px;
  right: 0;
  background-color: var(--color-bg-primary, white);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 240px;
  z-index: 1000;
  overflow: hidden;
  border: 1px solid var(--color-focus, rgba(0,0,0,0.1));
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.2s ease;
  pointer-events: none;
}

.dropdown-menu.visible,
.dropdown-menu[style*="display: block"] {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.dropdown-header {
  display: flex;
  padding: 16px;
  background-color: var(--color-bg-secondary, #f8fafc);
}

.dropdown-profile-picture {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-primary-light);
}

.dropdown-user-info {
  margin-left: 12px;
  overflow: hidden;
}

.dropdown-user-name {
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-user-email {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-divider {
  height: 1px;
  background-color: var(--color-focus, #e0e0e0);
  margin: 0;
}

.logout-button {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  color: var(--color-text-primary);
  transition: background-color var(--transition-speed) ease;
  font-weight: 500;
}

.logout-button:hover {
  background-color: var(--color-hover);
}

.logout-icon {
  margin-right: 8px;
  color: var(--color-error);
}

.login-button {
  display: inline-block;
}

.primary-button {
  background-color: var(--color-primary, #3498db);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-speed) ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.primary-button:hover {
  background-color: var(--color-primary-dark, #2980b9);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.primary-button:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .user-info {
    display: none;
  }
  
  .dropdown-icon {
    display: none;
  }
  
  .profile-container {
    padding: 4px;
  }
  
  .profile-picture {
    width: 32px;
    height: 32px;
  }
}
</style> 