<template>
  <BaseModal
    :show="show"
    title="Share with Circles"
    :primary-disabled="selectedCircles.length === 0 || saving"
    :loading="saving"
    @close="close"
    @primary-action="saveSharing"
  >
    <template #icon-path>
      <circle cx="12" cy="12" r="9"></circle>
      <circle cx="12" cy="10" r="3"></circle>
      <path d="M6.5 18.2c1.2-1.5 3.3-2.5 5.5-2.5s4.3 1 5.5 2.5"></path>
    </template>
    
    <template #primary-text>Share</template>
    <template #loading-text>Sharing...</template>
    
    <p class="modal-description">
      <template v-if="albumId || albumName">
        Share "{{ albumName }}" with your trusted circles
      </template>
      <template v-else>
        Share {{ mediaIds.length }} selected item(s) with your trusted circles
      </template>
    </p>
        
    <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading your circles...</p>
        </div>
        
    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="fetchCircles" class="retry-button">Try Again</button>
        </div>
        
    <div v-else-if="circles.length === 0" class="no-circles-message">
          <p>You don't have any circles yet.</p>
      <button @click="goToCircles" class="secondary-button">Create a Circle</button>
        </div>
        
        <div v-else class="circles-list">
          <div 
            v-for="circle in circles" 
        :key="circle._id" 
            class="circle-item"
        :class="{ 'selected': selectedCircles.includes(circle._id) }"
        @click="toggleCircle(circle._id)"
          >
        <div class="circle-icon">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="9"></circle>
            <circle cx="12" cy="10" r="3"></circle>
            <path d="M6.5 18.2c1.2-1.5 3.3-2.5 5.5-2.5s4.3 1 5.5 2.5"></path>
          </svg>
            </div>
            
            <div class="circle-details">
              <div class="circle-name">{{ circle.name }}</div>
          <div class="circle-members">{{ circle.memberCount || 0 }} member{{ circle.memberCount !== 1 ? 's' : '' }}</div>
          </div>
        </div>
      </div>
      
    <div v-if="selectedCircles.length > 0" class="selection-info">
      Selected {{ selectedCircles.length }} circle{{ selectedCircles.length !== 1 ? 's' : '' }}
    </div>
  </BaseModal>
</template>

<script>
import api from '../services/api';
import BaseModal from './ui/BaseModal.vue';

export default {
  name: 'CircleSelectorModal',
  components: {
    BaseModal
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    mediaIds: {
      type: Array,
      default: () => []
    },
    albumId: {
      type: String,
      default: null
    },
    albumName: {
      type: String,
      default: null
    },
    sharedCircleIds: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      circles: [],
      selectedCircles: [...this.sharedCircleIds],
      loading: true,
      saving: false,
      error: null
    };
  },
  watch: {
    show(val) {
      if (val) {
        this.fetchCircles();
        // Reset selections only if we don't have initial shared circles
        if (this.sharedCircleIds.length === 0) {
          this.selectedCircles = [];
        }
      }
    },
    sharedCircleIds: {
      immediate: true,
      handler(newVal) {
        this.selectedCircles = [...newVal];
      }
    }
  },
  created() {
    if (this.show) {
      this.fetchCircles();
    }
  },
  methods: {
    async getUserCircles() {
      try {
        const response = await api.get('/circles');
        
        if (response && response.data) {
          if (Array.isArray(response.data)) {
            return response.data;
          } else if (response.data.circles && Array.isArray(response.data.circles)) {
            return response.data.circles;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            return response.data.data;
          }
        }
        
        const userCirclesResponse = await api.get('/user/circles');
        
        if (userCirclesResponse && userCirclesResponse.data) {
          if (Array.isArray(userCirclesResponse.data)) {
            return userCirclesResponse.data;
          } else if (userCirclesResponse.data.circles && Array.isArray(userCirclesResponse.data.circles)) {
            return userCirclesResponse.data.circles;
          }
        }
        
        return [];
      } catch (error) {
        console.error('Error fetching user circles:', error);
        throw error;
      }
    },
    
    async fetchCircles() {
      this.loading = true;
      this.error = null;
      
      try {
        const circlesData = await this.getUserCircles();
        
        this.circles = circlesData.map(circle => {
          return {
            _id: circle._id || circle.id,
            name: circle.name || 'Unnamed Circle',
            memberCount: circle.memberCount || circle.members?.length || 0,
          };
        });
      } catch (err) {
        console.error('Error fetching circles:', err);
        this.error = `Failed to load circles: ${err.message}`;
      } finally {
        this.loading = false;
      }
    },
    
    toggleCircle(circleId) {
      const index = this.selectedCircles.indexOf(circleId);
      
      if (index === -1) {
        this.selectedCircles.push(circleId);
      } else {
        this.selectedCircles.splice(index, 1);
      }
    },
    
    async saveSharing() {
      if (this.selectedCircles.length === 0) return;
      
      this.saving = true;
        
      try {
        if (this.albumId) {
          const response = await api.put(`/albums/${this.albumId}/share`, {
            circleIds: this.selectedCircles
          });
          
          this.$emit('saved', {
            albumId: this.albumId,
            circleIds: this.selectedCircles,
            success: response.data.success
          });
        this.$emit('shared', {
            circleIds: this.selectedCircles,
            result: response.data
          });
        } else {
          const successResults = [];
          const failedIds = [];
          
          await Promise.all(
            this.mediaIds.map(async (mediaId) => {
              try {
                const response = await api.put(`/files/${mediaId}/share`, {
                  circleIds: this.selectedCircles
                });
                
                if (response.data.success) {
                  successResults.push(mediaId);
                } else {
                  failedIds.push(mediaId);
                }
              } catch (err) {
                console.error(`Error sharing media item ${mediaId}:`, err);
                failedIds.push(mediaId);
              }
            })
          );
          
          this.$emit('saved', {
            mediaIds: this.mediaIds,
            successCount: successResults.length,
            failedCount: failedIds.length,
            circleIds: this.selectedCircles
          });
        }
        
        this.close();
      } catch (err) {
        console.error('Error while sharing with circles:', err);
        this.error = 'An error occurred while sharing. Please try again.';
      } finally {
        this.saving = false;
      }
    },
    
    goToCircles() {
      this.$router.push('/circles');
      this.close();
    },
    
    close() {
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
.modal-description {
  margin-bottom: 20px;
  color: var(--color-text-secondary);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.loading-spinner {
  border: 3px solid var(--color-border);
  border-radius: 50%;
  border-top: 3px solid var(--color-primary);
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  background-color: rgba(var(--color-error), 0.1);
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  margin: 20px 0;
}

.error-message {
  color: var(--color-error);
  margin-bottom: 15px;
}

.retry-button {
  background-color: var(--color-error);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.no-circles-message {
  text-align: center;
  padding: 30px 0;
}

.secondary-button {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  padding: 10px 20px;
  border-radius: 10px;
  margin-top: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.secondary-button:hover {
  background-color: rgba(var(--color-primary-rgb), 0.1);
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: translateY(-1px);
}

.circles-list {
  margin-top: 10px;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--color-border);
  border-radius: 10px;
}

.circle-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.2s ease;
}

.circle-item:last-child {
  border-bottom: none;
}

.circle-item:hover {
  background-color: rgba(var(--color-primary-rgb), 0.05);
}

.circle-item.selected {
  background-color: rgba(var(--color-primary-rgb), 0.1);
  border-left: 3px solid var(--color-primary);
}

.circle-icon {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  background-color: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  transition: all 0.2s ease;
}

.circle-item:hover .circle-icon {
  transform: scale(1.05);
}

.circle-item.selected .circle-icon {
  background-color: var(--color-primary);
  color: white;
}

.circle-details {
  flex: 1;
}

.circle-name {
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.circle-members {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.selection-info {
  margin-top: 20px;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  background-color: rgba(var(--color-primary-rgb), 0.1);
  padding: 8px 12px;
  border-radius: 8px;
  display: inline-block;
}

/* Dark mode overrides */
[data-theme="dark"] .circle-icon {
  background-color: rgba(156, 106, 222, 0.2);
}

[data-theme="dark"] .circle-item.selected .circle-icon {
  background-color: var(--color-primary);
}

[data-theme="dark"] .circles-list {
  border-color: rgba(156, 106, 222, 0.2);
  background-color: var(--color-bg-secondary);
}

[data-theme="dark"] .circle-item {
  border-color: rgba(156, 106, 222, 0.1);
}

[data-theme="dark"] .secondary-button {
  border-color: rgba(156, 106, 222, 0.3);
}

[data-theme="dark"] .error-container {
  background-color: rgba(239, 68, 68, 0.15);
}
</style> 