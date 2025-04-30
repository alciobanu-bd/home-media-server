<template>
  <div class="modal-overlay" v-if="show">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Account Settings</h2>
        <button class="close-btn" @click="close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      
      <div class="modal-content">
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
      </div>
      
      <div class="modal-footer">
        <button class="cancel-btn" @click="close">Cancel</button>
        <button class="save-btn" @click="saveSettings">Save Changes</button>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, onMounted, onBeforeUnmount, computed } from 'vue';
import authStore from '../store/authStore';
import StorageQuota from './StorageQuota.vue';

export default {
  name: 'AccountSettingsModal',
  components: {
    StorageQuota
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
    
    const handleKeydown = (event) => {
      if (event.key === 'Escape') {
        close();
      }
    };
    
    onMounted(() => {
      window.addEventListener('keydown', handleKeydown);
    });
    
    onBeforeUnmount(() => {
      window.removeEventListener('keydown', handleKeydown);
    });
    
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
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background-color: var(--color-card-background, white);
  border-radius: 12px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: modal-appear 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modal-appear {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: var(--color-hover);
  color: var(--color-text-primary);
}

.modal-content {
  padding: 24px;
}

.profile-section {
  display: flex;
  align-items: center;
  margin-bottom: 28px;
}

.profile-picture-container {
  position: relative;
  margin-right: 20px;
}

.profile-picture {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-primary);
  box-shadow: 0 3px 12px rgba(var(--color-primary-rgb), 0.2);
}

.profile-picture-overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.profile-picture-container:hover .profile-picture-overlay {
  opacity: 1;
}

.change-picture-btn {
  background-color: var(--color-card-background, white);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--color-text-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.change-picture-btn svg {
  margin-right: 4px;
}

.change-picture-btn:hover {
  background-color: var(--color-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: 600;
  font-size: 18px;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.user-email {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.storage-section {
  margin-top: 24px;
  margin-bottom: 24px;
}

.storage-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--color-text-primary);
}

.settings-section {
  margin-top: 24px;
}

.settings-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--color-text-primary);
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.form-control {
  width: 100%;
  padding: 10px 14px;
  font-size: 14px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-bg-tertiary, rgba(239, 242, 245, 0.5));
  color: var(--color-text-primary);
  transition: all 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.2);
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.cancel-btn {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--color-text-primary);
  margin-right: 12px;
}

.cancel-btn:hover {
  background-color: var(--color-hover);
}

.save-btn {
  background-color: var(--color-primary);
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
  box-shadow: 0 2px 8px rgba(var(--color-primary-rgb), 0.3);
}

.save-btn:hover {
  opacity: 0.8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.4);
}

.save-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(var(--color-primary-rgb), 0.3);
}
</style> 