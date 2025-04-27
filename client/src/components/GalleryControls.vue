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
          <svg class="upload-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4s-6.67 2.59-7.35 6.04C2.95 10.22 1 12.36 1 15c0 3.31 2.69 6 6 6h10c3.31 0 6-2.69 6-6 0-2.64-1.95-4.78-4.65-4.96z" />
            <path d="M11 16v-4H8l4-4 4 4h-3v4h-2z" />
          </svg>
          <span class="btn-text">Upload</span>
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
              <img :src="baseUrl + 'img/close.svg'" alt="Cancel" width="20" height="20" />
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

    return {
      baseUrl,
      showControls,
      isSelecting,
      selectedCount,
      uploadMedia,
      deleteSelected,
      cancelSelection
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
  background-color: var(--color-button-background);
  color: var(--color-button-text);
  border: none;
  min-width: 180px;
}

.upload-btn:hover {
  background-color: var(--color-button-background);
}

.upload-btn:disabled {
  background-color: var(--color-button-disabled);
  cursor: not-allowed;
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
  color: #333;
  border: 1px solid #ccc;
}

.cancel-btn:hover {
  background-color: rgba(0, 0, 0, 0.03); /* Very light gray background on hover */
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

.btn-content svg.upload-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
}
</style> 