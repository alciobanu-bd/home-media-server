<template>
  <div v-if="showControls" class="gallery-controls">
    <button 
      v-if="!isSelecting" 
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
    
    <button 
      v-if="!isSelecting" 
      @click="startSelection" 
      class="action-btn select-btn" 
      title="Select Items"
    >
      <span class="btn-content">
        <svg class="select-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M9 12l2 2l4 -4" />
        </svg>
        <span class="btn-text">Select</span>
      </span>
    </button>
    
    <button 
      v-if="isSelecting && selectedCount > 0" 
      @click="deleteSelected" 
      class="action-btn delete-btn"
      title="Delete Selected"
    >
      <span class="btn-content">
        <img :src="baseUrl + 'img/delete-icon.svg'" alt="Delete" width="20" height="20" />
        <span class="btn-text">Delete ({{ selectedCount }})</span>
      </span>
    </button>
    
    <button 
      v-if="isSelecting" 
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

    const startSelection = () => {
      galleryControlsStore.toggleSelectMode();
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
      startSelection,
      deleteSelected,
      cancelSelection
    };
  }
};
</script>

<style scoped>
.gallery-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

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
  min-width: 160px;
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

/* --- Select Button (matching Lumia theme) --- */
.select-btn {
  background-color: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  min-width: 180px;
}

.select-btn:hover {
  background-color: var(--color-hover);
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
  .gallery-controls {
    gap: 8px;
  }

  .action-btn {
    padding: 7px 14px;
    font-size: 13px;
    min-width: 120px;
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

.btn-content svg.select-icon {
  width: 16px;
  height: 16px;
  stroke: currentColor;
}
</style> 