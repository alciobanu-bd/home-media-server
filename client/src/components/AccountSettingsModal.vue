<template>
  <BaseModal
    :show="show"
    title="Account Settings"
    @close="close"
    @primary-action="saveSettings"
  >
    <template #icon-path>
      <circle cx="12" cy="8" r="4"/>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      <path d="M21 20.94c-1.73-.83-2.94-2.56-3-4.56"/>
    </template>
    
    <template #primary-text>Save Changes</template>
    
    <div class="profile-section">
      <div class="profile-picture-container">
        <img :src="user.picture" alt="Profile Picture" class="profile-picture" />
        <div class="profile-picture-overlay">
          <button class="change-picture-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 3H7C4.79086 3 3 4.79086 3 7V17C3 19.2091 4.79086 21 7 21H17C19.2091 21 21 19.2091 21 17V7C21 4.79086 19.2091 3 17 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8.5 10C9.32843 10 10 9.32843 10 8.5C10 7.67157 9.32843 7 8.5 7C7.67157 7 7 7.67157 7 8.5C7 9.32843 7.67157 10 8.5 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M21 15L16 10L7 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Change
          </button>
        </div>
      </div>
      <div class="user-info">
        <div class="user-name">{{ user.name }}</div>
        <div class="user-email">{{ user.email }}</div>
      </div>
    </div>
    
    <div class="storage-section">
      <h3>Storage</h3>
      <StorageQuota title="Your Storage Usage" />
    </div>
    
    <div class="settings-section">
      <h3>Preferences</h3>
      <div class="form-group">
        <label for="theme">Theme</label>
        <select id="theme" v-model="userData.theme" class="form-control">
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System Default</option>
        </select>
      </div>
    </div>
  </BaseModal>
</template>

<script>
import { reactive, computed } from 'vue';
import authStore from '../store/authStore';
import StorageQuota from './StorageQuota.vue';
import BaseModal from './ui/BaseModal.vue';

export default {
  name: 'AccountSettingsModal',
  components: {
    StorageQuota,
    BaseModal
  },
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'save'],
  setup(props, { emit }) {
    const user = computed(() => authStore.state.user);
    
    // Create a copy of user data to avoid direct mutations
    const userData = reactive({
      picture: user.value?.picture || '',
      theme: user.value?.preferences?.theme || 'system'
    });
    
    const close = () => {
      emit('close');
    };
    
    const saveSettings = () => {
      // Here you would normally save the settings to your backend
      // For now, just emit an event with the updated data
      emit('save', { ...userData });
      close();
    };
    
    return {
      user,
      userData,
      close,
      saveSettings
    };
  }
};
</script>

<style scoped>
.profile-section {
  display: flex;
  align-items: center;
  margin-bottom: 28px;
}

.profile-picture-container {
  position: relative;
  width: 80px;
  height: 80px;
  margin-right: 20px;
  border-radius: 50%;
  overflow: hidden;
}

.profile-picture {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-picture-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.profile-picture-container:hover .profile-picture-overlay {
  opacity: 1;
}

.change-picture-btn {
  background: none;
  border: none;
  color: white;
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 0;
  gap: 6px;
}

.change-picture-btn svg {
  stroke: white;
  margin-bottom: 4px;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  font-size: 1.2rem;
  color: var(--color-text-primary);
  margin-bottom: 2px;
}

.user-email {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.storage-section, .settings-section {
  margin-bottom: 28px;
}

h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--color-text-primary);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border);
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.1);
}

/* Dark mode overrides */
[data-theme="dark"] .form-control {
  background-color: var(--color-bg-secondary);
  border-color: rgba(156, 106, 222, 0.3);
}

[data-theme="dark"] h3 {
  color: var(--color-text-light);
  border-color: rgba(156, 106, 222, 0.2);
}

[data-theme="dark"] .user-name {
  color: var(--color-text-light);
}

[data-theme="dark"] .form-group label {
  color: var(--color-text-light);
  opacity: 0.8;
}
</style> 