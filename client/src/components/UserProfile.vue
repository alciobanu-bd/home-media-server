<template>
  <div class="user-profile" v-if="authStore.state.isAuthenticated">
    <div class="profile-container" @click="toggleDropdown">
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
    
    <div class="dropdown-menu" v-if="showDropdown" ref="dropdown">
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
    };
    
    const logout = async () => {
      await authStore.logout();
      showDropdown.value = false;
    };
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdown.value && !dropdown.value.contains(event.target) && showDropdown.value) {
        showDropdown.value = false;
      }
    };
    
    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
    });
    
    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside);
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
  transition: background-color 0.2s;
  background-color: var(--color-hover, rgba(0,0,0,0.05));
}

.profile-container:hover {
  background-color: var(--color-hover-dark, rgba(0,0,0,0.1));
}

.profile-picture {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  display: flex;
  flex-direction: column;
  margin: 0 8px;
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
  font-size: 10px;
  color: var(--color-text-secondary);
  margin-left: 4px;
}

.dropdown-menu {
  position: absolute;
  top: 52px;
  right: 0;
  background-color: var(--color-card-background);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 240px;
  z-index: 100;
  overflow: hidden;
}

.dropdown-header {
  display: flex;
  padding: 16px;
}

.dropdown-profile-picture {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.dropdown-user-info {
  margin-left: 12px;
  overflow: hidden;
}

.dropdown-user-name {
  font-weight: 500;
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
  background-color: var(--color-border, #e0e0e0);
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
  transition: background-color 0.2s;
}

.logout-button:hover {
  background-color: var(--color-hover);
}

.logout-icon {
  margin-right: 8px;
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
  transition: background-color 0.2s;
}

.primary-button:hover {
  background-color: var(--color-primary-dark, #2980b9);
}
</style> 