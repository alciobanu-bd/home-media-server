<template>
  <div v-if="showControls" class="gallery-controls">
    <button 
      v-if="!isSelecting" 
      @click="uploadMedia" 
      class="action-btn upload-btn" 
      title="Upload Media"
    >
      <span class="btn-content">
        <img :src="baseUrl + 'img/upload-icon.svg'" alt="Upload" width="20" height="20" />
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
        <img :src="baseUrl + 'img/checkbox-icon.svg'" alt="Select" width="20" height="20" />
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

/* --- Upload Button (matching UploadModal's upload-btn) --- */
.upload-btn {
  background-color: #4caf50; /* Green color from UploadModal */
  color: white;
  border: none;
  min-width: 180px;
}

.upload-btn:hover {
  background-color: #43a047; /* Slightly darker green */
}

.upload-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* --- Select Button (matching UploadModal's cancel-btn style but with proper color) --- */
.select-btn {
  background-color: transparent;
  color: #333;
  border: 1px solid #ccc;
  min-width: 180px;
}

.select-btn:hover {
  background-color: rgba(0, 0, 0, 0.03); /* Very light gray background on hover */
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
</style> 