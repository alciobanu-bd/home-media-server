<template>
  <div class="user-profile" v-if="authStore.state.isAuthenticated">
    <div class="profile-container" @click.stop="toggleDropdown" :class="{ 'active': showDropdown }">
      <div class="avatar-container">
      <img 
        :src="authStore.state.user.picture" 
        alt="Profile" 
        class="profile-picture"
      />
        <div class="status-indicator"></div>
      </div>
      <div class="user-info">
        <span class="user-name">{{ authStore.state.user.name }}</span>
        <span class="user-email">{{ authStore.state.user.email }}</span>
      </div>
      <svg class="dropdown-icon" width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
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
          <div class="user-status">
            <span class="status-dot"></span>
            <span class="status-text">Online</span>
          </div>
        </div>
      </div>
      
      <StorageQuota :is-compact="true" />
      
      <div class="dropdown-menu-items">
        <a class="menu-item" href="#" @click.prevent="openAccountSettings">
          <svg class="menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Account Settings
        </a>
        <a class="menu-item" href="#">
          <svg class="menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 2V4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 20V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M4.93 4.93L6.34 6.34" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M17.66 17.66L19.07 19.07" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12H4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M20 12H22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6.34 17.66L4.93 19.07" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M19.07 4.93L17.66 6.34" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Preferences
        </a>
        <a class="menu-item" href="#">
          <svg class="menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 17L21 12L16 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="logout-text" @click="logout">Logout</span>
        </a>
      </div>
    </div>
    
    <AccountSettingsModal 
      :show="showAccountSettingsModal" 
      :userObj="authStore.state.user"
      @close="closeAccountSettings"
    />
  </div>
  <div class="login-button" v-else>
    <button class="primary-button" @click="authStore.loginWithGoogle">
      <svg class="google-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#FFC107"/>
        <path d="M3.15302 7.3455L6.43851 9.755C7.32751 7.554 9.48052 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C8.15902 2 4.82802 4.1685 3.15302 7.3455Z" fill="#FF3D00"/>
        <path d="M12 22C14.583 22 16.93 21.0115 18.7045 19.404L15.6095 16.785C14.5718 17.5742 13.3038 18.001 12 18C9.39897 18 7.19047 16.3415 6.35847 14.027L3.09747 16.5395C4.75247 19.778 8.11347 22 12 22Z" fill="#4CAF50"/>
        <path d="M21.8055 10.0415H21V10H12V14H17.6515C17.2571 15.1082 16.5467 16.0766 15.608 16.7855L15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#1976D2"/>
      </svg>
      Sign in with Google
    </button>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import authStore from '../store/authStore';
import AccountSettingsModal from './AccountSettingsModal.vue';
import StorageQuota from './StorageQuota.vue';

export default {
  name: 'UserProfile',
  components: {
    AccountSettingsModal,
    StorageQuota
  },
  setup() {
    const showDropdown = ref(false);
    const dropdown = ref(null);
    const showAccountSettingsModal = ref(false);
    
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
    
    const openAccountSettings = () => {
      showDropdown.value = false;
      showAccountSettingsModal.value = true;
    };
    
    const closeAccountSettings = () => {
      showAccountSettingsModal.value = false;
    };
    
    const handleSettingsSave = async (updatedSettings) => {
      console.log('Settings updated:', updatedSettings);
      try {
        const success = await authStore.updateUserSettings(updatedSettings);
        if (!success) {
          console.error('Failed to update settings:', authStore.state.error);
          // You might want to show a notification to the user here
        }
      } catch (error) {
        console.error('Error updating settings:', error);
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
      logout,
      showAccountSettingsModal,
      openAccountSettings,
      closeAccountSettings,
      handleSettingsSave
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
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  background-color: var(--color-bg-tertiary, rgba(239, 242, 245, 0.5));
  border: 1px solid transparent;
}

.profile-container:hover {
  background-color: var(--color-hover);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.profile-container.active {
  background-color: var(--color-hover-dark);
  border-color: var(--color-primary);
}

.avatar-container {
  position: relative;
}

.profile-picture {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--color-success);
  border: 2px solid var(--color-bg-primary);
}

.profile-container:hover .profile-picture {
  border-color: var(--color-primary);
  transform: scale(1.05);
}

.user-info {
  display: flex;
  flex-direction: column;
  margin: 0 10px;
  overflow: hidden;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 130px;
}

.user-email {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 130px;
}

.dropdown-icon {
  color: var(--color-text-secondary);
  margin-left: 6px;
  transition: transform 0.3s ease;
}

.profile-container:hover .dropdown-icon {
  color: var(--color-primary);
}

.profile-container.active .dropdown-icon {
  transform: rotate(180deg);
  color: var(--color-primary);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background-color: var(--color-card-background, white);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
  width: 280px;
  z-index: 1000;
  overflow: hidden;
  border: 1px solid var(--color-border);
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}

.dropdown-menu.visible {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.dropdown-header {
  display: flex;
  align-items: center;
  padding: 20px;
  background-color: var(--color-bg-secondary, #f8fafc);
  border-bottom: 1px solid var(--color-border);
}

.dropdown-profile-picture {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-primary);
  box-shadow: 0 3px 12px rgba(var(--color-primary-rgb), 0.2);
}

.dropdown-user-info {
  margin-left: 15px;
  overflow: hidden;
}

.dropdown-user-name {
  font-weight: 600;
  font-size: 16px;
  color: var(--color-text-primary);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-user-email {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-status {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-success);
  margin-right: 5px;
}

.status-text {
  color: var(--color-success);
  font-weight: 500;
  font-size: 12px;
}

.quota-info {
  padding: 15px 20px;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary, #f8fafc);
}

.quota-header {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.quota-progress {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-bar {
  height: 6px;
  background-color: var(--color-bg-tertiary);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--color-primary);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.quota-text {
  font-size: 12px;
  color: var(--color-text-secondary);
  display: flex;
  justify-content: space-between;
}

.dropdown-menu-items {
  padding: 10px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: var(--color-text-primary);
  text-decoration: none;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 14px;
}

.menu-item:hover {
  background-color: var(--color-hover);
  color: var(--color-primary);
}

.menu-icon {
  margin-right: 12px;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
}

.menu-item:hover .menu-icon {
  color: var(--color-primary);
  transform: translateX(2px);
}

.logout-text {
  color: var(--color-error);
  cursor: pointer;
}

.menu-item:hover .logout-text {
  color: var(--color-error-dark);
}

.login-button {
  display: inline-block;
}

.primary-button {
  display: flex;
  align-items: center;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(var(--color-primary-rgb), 0.3);
}

.google-icon {
  margin-right: 10px;
}

.primary-button:hover {
  opacity: 0.8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.4);
}

.primary-button:active {
  transform: translateY(0);
  background-color: var(--color-primary-dark);
  box-shadow: 0 2px 4px rgba(var(--color-primary-rgb), 0.3);
}

@media (max-width: 768px) {
  .user-info {
    display: none;
  }
  
  .dropdown-icon {
    display: none;
  }
  
  .profile-container {
    padding: 6px;
  }
  
  .profile-picture {
    width: 32px;
    height: 32px;
  }
  
  .status-indicator {
    width: 8px;
    height: 8px;
  }
}
</style> 