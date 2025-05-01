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
          class="control-btn album-btn"
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
          class="control-btn delete-btn"
          title="Delete Selected"
        >
          <svg class="btn-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
          Delete
        </button>
        
        <button 
          @click="cancelSelection" 
          class="control-btn cancel-btn"
          title="Cancel Selection"
        >
          <svg class="btn-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          Cancel
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

/* --- Upload Button (matching Lumia theme) --- */
.upload-btn {
  background: var(--lumia-gradient);
  color: white;
  border: none;
  min-width: 180px;
  height: 40px;
  border-radius: 8px;
  box-shadow: var(--lumia-shadow);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  padding: 0 18px; /* Adjusted padding for height consistency */
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  z-index: 2;
}

.upload-btn:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.2));
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.upload-btn:hover:before {
  opacity: 1;
}

.upload-btn .upload-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
  position: relative;
  z-index: 2;
}

.upload-btn:hover .upload-icon {
  transform: translateY(-2px);
}

.upload-btn .btn-text {
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  letter-spacing: 0.5px;
  font-size: 14px;
  color: white;
  position: relative;
  z-index: 2;
}

.upload-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(156, 106, 222, 0.35);
}

.upload-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(156, 106, 222, 0.2);
}

.upload-btn:disabled {
  background: #cbd5e1; /* Use a neutral disabled color */
  opacity: 0.7;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.upload-btn:disabled .upload-icon {
  opacity: 0.7;
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
  justify-content: center;
  gap: 8px;
  padding: 8px 14px;
  min-width: 140px;
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

/* Delete Button - Error themed */
.delete-btn {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
  position: relative;
  overflow: hidden;
}

.delete-btn:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.2));
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.delete-btn:hover:before {
  opacity: 0;
}

.delete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(220, 38, 38, 0.4);
}

.delete-btn .btn-icon {
  position: relative;
  z-index: 2;
}

/* Cancel Button - Neutral themed */
.cancel-btn {
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.cancel-btn:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.cancel-btn:hover:before {
  opacity: 0;
}

.cancel-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.cancel-btn .btn-icon {
  position: relative;
  z-index: 2;
}

/* Dark mode enhancements */
@media (prefers-color-scheme: dark) {
  .delete-btn {
    box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4);
  }
  
  .delete-btn:hover {
    box-shadow: 0 6px 20px rgba(220, 38, 38, 0.5);
  }
  
  .cancel-btn {
    background: #2a2a2a;
    color: #bbbbbb;
    border-color: #404040;
  }
  
  .cancel-btn:hover {
    background: #333333;
    color: #f5f5f5;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  }
}

/* Album Button - Lumia themed */
.album-btn {
  background: var(--lumia-gradient);
  color: white;
  border: none;
  box-shadow: var(--lumia-shadow);
  position: relative;
  overflow: hidden;
}

.album-btn:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.2));
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.album-btn:hover:before {
  opacity: 0;
}

.album-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(156, 106, 222, 0.35);
}

.album-btn .btn-icon {
  position: relative;
  z-index: 2;
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