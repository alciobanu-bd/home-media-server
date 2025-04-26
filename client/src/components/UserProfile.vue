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
  padding: 4px 8px;
  border-radius: var(--border-radius-lg);
  transition: var(--base-transition);
  background-color: transparent;
}

.profile-container:hover {
  background-color: var(--color-hover);
  transform: translateY(0);
}

.profile-container:active {
  background-color: var(--color-hover-dark);
  transform: translateY(0);
}

.profile-picture {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--color-border);
  transition: var(--base-transition);
}

.profile-container:hover .profile-picture {
  border-color: var(--color-primary-light);
  box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.2);
}

.user-info {
  display: flex;
  flex-direction: column;
  margin: 0 10px;
  overflow: hidden;
}

.user-name {
  font-weight: 500;
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
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-left: 6px;
  transition: var(--base-transition);
}

.profile-container:hover .dropdown-icon {
  transform: translateY(0);
}

.profile-container[aria-expanded="true"] .dropdown-icon {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background-color: var(--color-bg-primary, white);
  border-radius: var(--border-radius-lg);
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.1);
  width: 260px;
  z-index: 1000;
  overflow: hidden;
  border: 1px solid var(--color-border);
  opacity: 0;
  transform: translateY(-5px);
  transition: opacity var(--transition-speed) ease-in-out, transform var(--transition-speed) ease-in-out;
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
  align-items: center;
  padding: 16px;
  background-color: var(--color-bg-secondary, #f8fafc);
  border-bottom: 1px solid var(--color-border);
}

.dropdown-profile-picture {
  width: 44px;
  height: 44px;
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
  margin-bottom: 2px;
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
  display: none;
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
  transition: var(--base-transition);
  font-weight: 500;
}

.logout-button:hover {
  background-color: var(--color-hover);
  color: var(--color-error);
}

.logout-icon {
  margin-right: 10px;
  color: var(--color-error);
  transition: var(--base-transition);
}

.logout-button:hover .logout-icon {
  transform: scale(1.1);
}

.login-button {
  display: inline-block;
}

.primary-button {
  background-color: var(--color-primary, #3498db);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--base-transition);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  line-height: 1.5;
}

.primary-button:hover {
  background-color: var(--color-primary-dark, #2980b9);
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.08);
}

.primary-button:active {
  transform: translateY(0);
  background-color: var(--color-primary-dark, #2980b9);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
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
    width: 30px;
    height: 30px;
  }
}
</style> 