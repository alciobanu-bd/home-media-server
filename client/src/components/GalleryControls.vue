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
      <div class="selection-count" v-if="selectedCount > 0">
        {{ selectedCount }} item{{ selectedCount !== 1 ? 's' : '' }} selected
      </div>
      
      <div class="selection-actions">
        <button 
          v-if="selectedCount > 0" 
          @click="addToAlbum" 
          class="control-btn"
          title="Add to Album"
        >
          <svg class="btn-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
            <path d="M12 9V15"></path>
            <path d="M9 12H15"></path>
          </svg>
          Add to Album
        </button>
        
        <button 
          v-if="selectedCount > 0" 
          @click="deleteSelected" 
          class="control-btn remove-btn"
          title="Delete Selected"
        >
          <img :src="baseUrl + 'img/delete-icon.svg'" alt="Delete" width="20" height="20" />
          Delete
        </button>
        
        <button 
          @click="cancelSelection" 
          class="control-btn"
          title="Cancel Selection"
        >
          <svg class="btn-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          Cancel Selection
        </button>
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
  display: flex;
  gap: 12px;
  margin-bottom: 0;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 20;
  background-color: var(--color-card-background);
  padding: 16px 24px;
  border-top: 1px solid var(--color-border);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  justify-content: center;
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

.selection-count {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-right: 12px;
}

.selection-actions {
  display: flex;
  gap: 12px;
}

/* Control button styles (matching Album view) */
.control-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  border: none;
}

.control-btn:hover {
  background-color: var(--color-hover-dark);
  color: var(--color-text-primary);
}

/* Delete/Remove Button */
.remove-btn {
  background-color: #ef4444;
  color: white;
}

.remove-btn:hover {
  background-color: #dc2626;
}

.btn-icon {
  stroke: currentColor;
  width: 20px;
  height: 20px;
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

.btn-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-content img {
  width: 20px;
  height: 20px;
}

@media (max-width: 768px) {
  .selection-controls {
    padding: 12px 16px;
  }
  
  .selection-count {
    font-size: 14px;
  }
  
  .selection-actions {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .control-btn {
    font-size: 13px;
    padding: 6px 12px;
  }
}
</style> 