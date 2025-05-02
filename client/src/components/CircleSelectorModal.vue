<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Share "{{ albumName }}" with Circles</h2>
      </div>
      
      <div class="modal-body">
        <p class="instruction-text">Select the circles you want to share this album with:</p>
        
        <div v-if="loading" class="loading-indicator">
          <div class="loading-spinner"></div>
          <p>Loading your circles...</p>
        </div>
        
        <div v-else-if="error" class="error-message">
          <p>{{ error }}</p>
          <button class="retry-btn" @click="loadCircles">Try Again</button>
        </div>
        
        <div v-else-if="!circles.length" class="empty-circles">
          <p>You don't have any circles yet.</p>
          <p>Create a circle first to share this album.</p>
          <button class="primary-btn" @click="goToCircles">Go to Circles</button>
        </div>
        
        <div v-else class="circles-list">
          <div 
            v-for="circle in circles" 
            :key="circle.id" 
            class="circle-item"
            :class="{ 'selected': selectedCircleIds.includes(circle.id) }"
            @click="toggleCircleSelection(circle.id)"
          >
            <div class="circle-checkbox">
              <input 
                type="checkbox" 
                :id="'circle-' + circle.id" 
                :checked="selectedCircleIds.includes(circle.id)"
                @click.stop
                @change="toggleCircleSelection(circle.id)"
              />
            </div>
            
            <div class="circle-details">
              <div class="circle-name">{{ circle.name }}</div>
              <div class="circle-meta">{{ circle.memberCount }} members</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="secondary-btn" @click="$emit('close')">Cancel</button>
        <button 
          class="primary-btn" 
          @click="shareAlbum"
          :disabled="processing || !selectedCircleIds.length"
        >
          <span v-if="processing">Sharing...</span>
          <span v-else>Share with {{ selectedCircleIds.length }} {{ selectedCircleIds.length === 1 ? 'Circle' : 'Circles' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import circlesService from '../services/circlesService';
import albumsService from '../services/albumsService';

export default {
  name: 'CircleSelectorModal',
  props: {
    albumId: {
      type: String,
      required: true
    },
    albumName: {
      type: String,
      required: true
    },
    sharedCircleIds: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      circles: [],
      selectedCircleIds: [...this.sharedCircleIds], // Start with already shared circles
      loading: true,
      processing: false,
      error: null
    };
  },
  created() {
    this.loadCircles();
  },
  methods: {
    async loadCircles() {
      try {
        this.loading = true;
        this.error = null;
        
        const response = await circlesService.getUserCircles();
        this.circles = response.circles || [];
      } catch (error) {
        console.error('Error loading circles:', error);
        this.error = 'Failed to load your circles. Please try again.';
      } finally {
        this.loading = false;
      }
    },
    
    toggleCircleSelection(circleId) {
      const index = this.selectedCircleIds.indexOf(circleId);
      if (index === -1) {
        this.selectedCircleIds.push(circleId);
      } else {
        this.selectedCircleIds.splice(index, 1);
      }
    },
    
    async shareAlbum() {
      if (this.selectedCircleIds.length === 0) return;
      
      try {
        this.processing = true;
        
        // Call albumsService to share album with selected circles
        const response = await albumsService.shareAlbumWithCircles(
          this.albumId, 
          this.selectedCircleIds
        );
        
        // Emit event to notify parent component
        this.$emit('shared', {
          circleIds: this.selectedCircleIds,
          result: response
        });
        
        // Close the modal
        this.$emit('close');
      } catch (error) {
        console.error('Error sharing album with circles:', error);
        
        let errorMessage = 'Failed to share album. Please try again.';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        alert(errorMessage);
      } finally {
        this.processing = false;
      }
    },
    
    goToCircles() {
      this.$router.push('/circles');
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
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--color-bg-primary);
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
  background: linear-gradient(90deg, rgba(156, 106, 222, 0.05), rgba(29, 209, 161, 0.05));
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  background: linear-gradient(90deg, #9c6ade, #1dd1a1);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 700;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.instruction-text {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--color-text-secondary);
}

.circles-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

.circle-item {
  display: flex;
  align-items: center;
  padding: 0.9rem 1rem;
  border-radius: 8px;
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.2s ease;
}

.circle-item:hover {
  background-color: var(--color-hover);
  transform: translateY(-1px);
}

.circle-item.selected {
  background-color: rgba(156, 106, 222, 0.1);
  border-color: #9c6ade;
}

.circle-checkbox {
  margin-right: 1rem;
}

.circle-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.circle-details {
  flex: 1;
}

.circle-name {
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 0.2rem;
}

.circle-meta {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--color-border);
  gap: 1rem;
  background: linear-gradient(90deg, rgba(156, 106, 222, 0.05), rgba(29, 209, 161, 0.05));
}

.secondary-btn {
  background: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}

.secondary-btn:hover {
  background: rgba(156, 106, 222, 0.1);
  border-color: #9c6ade;
  color: #9c6ade;
}

.primary-btn {
  background: linear-gradient(45deg, #9c6ade, #1dd1a1);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 12px rgba(156, 106, 222, 0.25);
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(156, 106, 222, 0.35);
}

.primary-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loading-spinner {
  border: 3px solid rgba(156, 106, 222, 0.1);
  border-radius: 50%;
  border-top: 3px solid #9c6ade;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem;
}

.error-message p {
  color: var(--color-error);
  margin-bottom: 1rem;
}

.retry-btn {
  background: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.empty-circles {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
}

.empty-circles p {
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
}

.empty-circles .primary-btn {
  margin-top: 1rem;
}
</style> 