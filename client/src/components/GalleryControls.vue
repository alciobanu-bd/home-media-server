<template>
  <div>
    <!-- Top controls - always visible when not in selection mode -->
    <div v-if="showControls && !isSelecting" class="gallery-controls top-controls">
      <button 
        @click="uploadMedia" 
        class="action-btn upload-btn" 
        title="Upload Media"
      >
        <span class="btn-content">
          <img :src="baseUrl + 'img/upload-icon-white.svg'" alt="Upload" class="upload-icon" width="20" height="20" />
          <span class="btn-text">Upload Media</span>
        </span>
      </button>
    </div>
    
    <!-- Bottom selection controls - only visible in selection mode -->
    <div v-if="showControls && isSelecting" class="selection-controls">
      <div class="selection-controls-inner">
        <div class="selection-count" v-if="selectedCount > 0">
          {{ selectedCount }} item{{ selectedCount !== 1 ? 's' : '' }} selected
        </div>
        
        <div class="selection-actions">
          <button 
            v-if="selectedCount > 0" 
            @click="addToAlbum" 
            class="action-btn select-btn"
            title="Add to Album"
          >
            <span class="btn-content">
              <svg class="album-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
                <path d="M12 9V15"></path>
                <path d="M9 12H15"></path>
              </svg>
              <span class="btn-text">Add to Album</span>
            </span>
          </button>
          
          <button 
            v-if="selectedCount > 0" 
            @click="deleteSelected" 
            class="action-btn delete-btn"
            title="Delete Selected"
          >
            <span class="btn-content">
              <img :src="baseUrl + 'img/delete-icon.svg'" alt="Delete" width="20" height="20" />
              <span class="btn-text">Delete</span>
            </span>
          </button>
          
          <button 
            @click="cancelSelection" 
            class="action-btn cancel-btn"
            title="Cancel Selection"
          >
            <span class="btn-content">
              <svg class="cancel-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              <span class="btn-text">Cancel</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import galleryControlsStore from '../store/galleryControlsStore';

export default {
  name: 'GalleryControls',
  setup() {
    const route = useRoute();
    const showControls = computed(() => route.path === '/' && galleryControlsStore.state.galleryInstance);
    const baseUrl = process.env.BASE_URL || '/';

    // Use computed properties to access store state
    const isSelecting = computed(() => galleryControlsStore.state.isSelecting);
    const selectedCount = computed(() => galleryControlsStore.state.selectedCount);

    const uploadMedia = () => {
      galleryControlsStore.openUploadModal();
    };

    const deleteSelected = () => {
      galleryControlsStore.deleteSelected();
    };

    const cancelSelection = () => {
      galleryControlsStore.toggleSelectMode();
    };

    const addToAlbum = () => {
      console.log('GalleryControls - addToAlbum called');
      galleryControlsStore.addToAlbum();
    };

    return {
      baseUrl,
      showControls,
      isSelecting,
      selectedCount,
      uploadMedia,
      deleteSelected,
      cancelSelection,
      addToAlbum
    };
  }
};
</script>

<style scoped>
/* Top controls styles */
.top-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Bottom selection controls styles */
.selection-controls {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  background-color: var(--color-card-background);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  padding: 12px 16px;
  transition: transform 0.3s ease-in-out;
  animation: slide-up 0.3s ease;
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.selection-controls-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selection-count {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text);
}

.selection-actions {
  display: flex;
  gap: 10px;
}

/* Common button styles */
.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  min-width: 120px;
  text-align: center;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-content img {
  width: 16px;
  height: 16px;
}

.btn-text {
  line-height: 1.2;
}

/* --- Upload Button (matching Lumia theme) --- */
.upload-btn {
  background-color: var(--color-primary);
  color: white;
  border: none;
  min-width: 180px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(var(--color-primary-rgb), 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  padding: 10px 18px;
}

.upload-btn:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.upload-btn .upload-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
}

.upload-btn .btn-text {
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-size: 13px;
  color: white;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(var(--color-primary-rgb), 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(var(--color-primary-rgb), 0); }
  100% { box-shadow: 0 0 0 0 rgba(var(--color-primary-rgb), 0); }
}

.upload-btn:hover {
  background-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.4);
  animation: pulse 1.5s infinite;
}

.upload-btn:hover:before {
  opacity: 1;
}

.upload-btn:hover .upload-icon {
  transform: translateY(-2px);
}

.upload-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(var(--color-primary-rgb), 0.2);
}

.upload-btn:disabled {
  background-color: var(--color-button-disabled);
  opacity: 0.7;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.upload-btn:disabled .upload-icon {
  opacity: 0.7;
}

/* When in a different context (not on primary-colored button), 
   use the theme color instead */
:not(.upload-btn) .upload-icon {
  filter: none;
  color: var(--color-primary);
}

/* --- Delete Button --- */
.delete-btn {
  background-color: #ef4444; /* Flat red */
  color: white;
  border: none;
}

.delete-btn:hover {
  background-color: #dc2626; /* Darker red on hover */
}

/* --- Cancel Button --- */
.cancel-btn {
  background-color: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.cancel-btn:hover {
  background-color: var(--color-hover);
}

@media (max-width: 768px) {
  .selection-controls-inner {
    flex-direction: column;
    gap: 12px;
  }
  
  .selection-count {
    align-self: flex-start;
  }
  
  .selection-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .action-btn {
    flex: 1;
    padding: 7px 14px;
    font-size: 13px;
    min-width: auto;
  }
  
  .btn-content img {
    width: 16px;
    height: 16px;
  }
}

.btn-content svg.cancel-icon {
  width: 16px;
  height: 16px;
  stroke: currentColor;
}
</style> 