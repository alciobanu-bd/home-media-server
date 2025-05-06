<template>
  <div class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Share with Circles</h2>
        <button @click="close" class="close-button">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div class="modal-body">
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
      </div>
      
      <div class="modal-actions">
        <button @click="close" class="cancel-button">Cancel</button>
        <button 
          @click="saveSharing" 
          class="save-button"
          :disabled="selectedCircles.length === 0 || saving"
        >
          <span v-if="saving">Sharing...</span>
          <span v-else>Share</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api';

export default {
  name: 'CircleSelectorModal',
  props: {
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
  created() {
    this.fetchCircles();
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
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  background-color: var(--color-background);
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.modal-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-background-light, var(--color-background));
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: var(--color-text-primary);
}

.close-button {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: var(--color-background-hover);
  color: var(--color-text-primary);
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex-grow: 1;
}

.modal-description {
  margin-top: 0;
  margin-bottom: 20px;
  color: var(--color-text-secondary);
}

.circles-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.circle-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  position: relative;
}

.circle-item:hover {
  background-color: var(--color-background-hover);
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  border-color: var(--color-border);
}

.circle-item.selected {
  background-color: var(--lumia-purple-light);
  border-color: var(--lumia-purple);
}

.circle-icon {
  color: var(--lumia-purple);
  margin-right: 12px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--lumia-purple-light, rgba(145, 95, 255, 0.1));
  transition: all 0.2s ease;
}

.circle-item:hover .circle-icon {
  transform: scale(1.05);
  background-color: var(--lumia-purple-light, rgba(145, 95, 255, 0.2));
}

.circle-item.selected .circle-icon {
  background-color: var(--lumia-purple);
  color: white;
}

.circle-details {
  flex-grow: 1;
}

.circle-name {
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.circle-members {
  font-size: 0.9em;
  color: var(--color-text-secondary);
}



.loading-container, .error-container, .no-circles-message {
  padding: 30px;
  text-align: center;
  color: var(--color-text-secondary);
}

.loading-spinner {
  border: 3px solid var(--color-border);
  border-top: 3px solid var(--lumia-purple);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: var(--color-error);
  margin-bottom: 16px;
}

.retry-button, .secondary-button {
  background-color: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.retry-button:hover, .secondary-button:hover {
  background-color: var(--color-background-hover);
}

.modal-actions {
  padding: 16px 20px;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-button {
  background-color: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.cancel-button:hover {
  background-color: var(--color-background-hover);
  transform: translateY(-1px);
}

.save-button {
  background-color: var(--lumia-purple);
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  box-shadow: 0 2px 5px rgba(145, 95, 255, 0.3);
}

.save-button:hover:not(:disabled) {
  background-color: var(--lumia-purple-dark, #7549d4);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(145, 95, 255, 0.4);
}

.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}
</style> 