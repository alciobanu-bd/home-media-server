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
        <img :src="userObj.picture" alt="Profile Picture" class="profile-picture" />
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
        <div class="user-name">{{ userObj.name }}</div>
        <div class="user-email">{{ userObj.email }}</div>
      </div>
    </div>
    
    <div class="storage-section">
      <h3>Storage</h3>
      <StorageQuota title="Your Storage Usage" />
    </div>
    
    <div class="subscription-section">
      <h3>Subscription Plan</h3>
      <div class="subscription-info">
        <div class="subscription-tier">
          <div class="tier-badge">{{ subscriptionInfo ? subscriptionInfo.name : 'Loading...' }}</div>
          <div v-if="subscriptionInfo" class="resource-efficiency">
            <div class="efficiency-label">Resource Efficiency:</div>
            <div class="efficiency-badges">
              <span 
                v-for="i in 5" 
                :key="i" 
                class="efficiency-badge"
                :class="{ 
                  'active': getResourceEfficiencyLevel() >= i,
                  'high': subscriptionInfo.tier === 'lite',
                  'medium': subscriptionInfo.tier === 'glow',
                  'low': subscriptionInfo.tier === 'aurora'
                }"
              ></span>
            </div>
            <span class="efficiency-text">{{ getResourceEfficiencyText() }}</span>
          </div>
        </div>
        <div class="subscription-description">
          {{ subscriptionInfo ? subscriptionInfo.description : 'Loading subscription details...' }}
        </div>
        <div class="resource-notice">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          Lumia is a limited resources project. Higher compression helps conserve storage and processing power.
          <router-link to="/status" class="status-link">View Project Status</router-link>
        </div>
        <div class="subscription-details">
          <div class="detail-item">
            <span class="detail-label">Storage:</span>
            <span class="detail-value">{{ subscriptionInfo ? formatStorageSize(subscriptionInfo.storageLimit) : '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Photo Quality:</span>
            <span class="detail-value">{{ getPhotoQualityDescription() }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Compression Level:</span>
            <span class="detail-value">{{ getCompressionDescription() }}</span>
            <div class="compression-meter">
              <div class="meter-bar">
                <div 
                  class="meter-fill" 
                  :style="{ width: getCompressionPercent() + '%', background: getCompressionColor() }"
                ></div>
              </div>
              <div class="meter-labels">
                <span>High Compression</span>
                <span>No Compression</span>
              </div>
              <div class="meter-hint">Higher compression helps conserve limited server resources</div>
            </div>
          </div>
          <div class="detail-item">
            <span class="detail-label">Video Quality:</span>
            <span class="detail-value">{{ getVideoQualityDescription() }}</span>
          </div>
        </div>
      </div>
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
import { ref, onMounted } from 'vue';
import StorageQuota from './StorageQuota.vue';
import BaseModal from './ui/BaseModal.vue';
import api from '../services/api';

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
    },
    userObj: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const userData = ref({
      name: props.userObj?.name || '',
      email: props.userObj?.email || '',
      picture: props.userObj?.picture || '',
      theme: props.userObj?.preferences?.theme || 'system'
    });
    
    const subscriptionInfo = ref(null);
    
    const close = () => {
      emit('close');
    };
    
    const saveSettings = () => {
      // Implement settings save logic later
      close();
    };
    
    const fetchSubscriptionInfo = async () => {
      try {
        const response = await api.get('/user/subscription');
        subscriptionInfo.value = response.data;
      } catch (error) {
        console.error('Error fetching subscription info:', error);
      }
    };
    
    const formatStorageSize = (bytes) => {
      if (!bytes) return '';
      
      const units = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      
      return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + units[i];
    };
    
    const getPhotoQualityDescription = () => {
      if (!subscriptionInfo.value || !subscriptionInfo.value.mediaQuality) return '';
      
      const photoSettings = subscriptionInfo.value.mediaQuality.photo;
      
      if (!photoSettings.maxResolution) {
        return 'Original resolution preserved';
      } else {
        return `Up to ${photoSettings.maxResolution}p resolution`;
      }
    };
    
    const getVideoQualityDescription = () => {
      if (!subscriptionInfo.value || !subscriptionInfo.value.mediaQuality) return '';
      
      const videoSettings = subscriptionInfo.value.mediaQuality.video;
      
      if (!videoSettings.maxResolution) {
        return 'Original quality preserved';
      } else {
        return `Up to ${videoSettings.maxResolution}p${videoSettings.maxFPS ? `, ${videoSettings.maxFPS}fps` : ''}`;
      }
    };
    
    const getCompressionDescription = () => {
      if (!subscriptionInfo.value || !subscriptionInfo.value.mediaQuality) return '';
      
      const photoSettings = subscriptionInfo.value.mediaQuality.photo;
      
      if (!photoSettings.compressionLevel) {
        return 'No compression';
      } else if (photoSettings.compressionLevel === 100) {
        return 'No compression (100%)';
      } else if (photoSettings.compressionLevel >= 90) {
        return 'Minimal compression';
      } else if (photoSettings.compressionLevel >= 80) {
        return 'Light compression';
      } else if (photoSettings.compressionLevel >= 70) {
        return 'Moderate compression';
      } else {
        return 'High compression';
      }
    };
    
    const getCompressionPercent = () => {
      if (!subscriptionInfo.value || !subscriptionInfo.value.mediaQuality) return 0;
      
      const photoSettings = subscriptionInfo.value.mediaQuality.photo;
      
      if (!photoSettings.compressionLevel) {
        return 100;
      } else {
        return photoSettings.compressionLevel;
      }
    };
    
    const getCompressionColor = () => {
      if (!subscriptionInfo.value || !subscriptionInfo.value.mediaQuality) return '';
      
      const photoSettings = subscriptionInfo.value.mediaQuality.photo;
      
      if (!photoSettings.compressionLevel) {
        return 'var(--color-success)';
      } else {
        // Generate color from green (100) to red (0)
        const hue = (photoSettings.compressionLevel * 1.2); // 0-120 range (red to green)
        return `hsl(${hue}, 70%, 45%)`;
      }
    };
    
    const getResourceEfficiencyLevel = () => {
      if (!subscriptionInfo.value) return 0;
      
      // Based on tier, return efficiency level
      switch (subscriptionInfo.value.tier) {
        case 'lite':
          return 5; // Highest efficiency (most compression)
        case 'glow':
          return 3; // Medium efficiency
        case 'aurora':
          return 1; // Lowest efficiency (no compression)
        default:
          return 0;
      }
    };
    
    const getResourceEfficiencyText = () => {
      if (!subscriptionInfo.value) return '';
      
      // Based on tier, return efficiency text
      switch (subscriptionInfo.value.tier) {
        case 'lite':
          return 'Optimized for resource efficiency';
        case 'glow':
          return 'Balanced resource usage';
        case 'aurora':
          return 'Premium resource allocation';
        default:
          return '';
      }
    };
    
    onMounted(() => {
      fetchSubscriptionInfo();
    });
    
    return {
      userData,
      subscriptionInfo,
      close,
      saveSettings,
      formatStorageSize,
      getPhotoQualityDescription,
      getVideoQualityDescription,
      getCompressionDescription,
      getCompressionPercent,
      getCompressionColor,
      getResourceEfficiencyLevel,
      getResourceEfficiencyText
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

.subscription-section {
  margin-top: 20px;
}

.subscription-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--color-text-primary);
}

.subscription-info {
  background-color: var(--color-bg-secondary, #f8fafc);
  border-radius: 8px;
  padding: 15px;
}

.tier-badge {
  display: inline-block;
  padding: 5px 10px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-white);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  border-radius: 12px;
  margin-bottom: 10px;
}

.resource-notice {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: rgba(var(--color-primary-rgb), 0.1);
  border-radius: 6px;
  padding: 10px;
  margin: 15px 0;
  font-size: 13px;
  color: var(--color-text-secondary);
  border-left: 3px solid var(--color-primary);
}

.resource-notice svg {
  flex-shrink: 0;
  stroke: var(--color-primary);
}

.subscription-description {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 15px;
}

.subscription-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.detail-value {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.compression-meter {
  margin-top: 8px;
}

.meter-bar {
  height: 8px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 4px;
}

.meter-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.meter-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--color-text-secondary);
}

.meter-hint {
  margin-top: 4px;
  font-size: 11px;
  color: var(--color-text-secondary);
  font-style: italic;
  text-align: center;
}

/* Dark mode overrides */
[data-theme="dark"] .resource-notice {
  background-color: rgba(156, 106, 222, 0.15);
  border-left-color: rgba(156, 106, 222, 0.8);
}

[data-theme="dark"] .resource-notice svg {
  stroke: rgba(156, 106, 222, 0.9);
}

.resource-efficiency {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.efficiency-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.efficiency-badges {
  display: flex;
  gap: 4px;
}

.efficiency-badge {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.1);
}

.efficiency-badge.active.high {
  background-color: #4caf50; /* Green for high efficiency */
}

.efficiency-badge.active.medium {
  background-color: #ff9800; /* Orange for medium efficiency */
}

.efficiency-badge.active.low {
  background-color: #f44336; /* Red for low efficiency */
}

.efficiency-text {
  font-size: 13px;
  color: var(--color-text-secondary);
  font-style: italic;
}

.status-link {
  display: block;
  margin-top: 8px;
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
}

.status-link:hover {
  text-decoration: underline;
}
</style> 