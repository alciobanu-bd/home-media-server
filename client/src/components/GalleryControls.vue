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
  gap: 10px; /* Slightly smaller gap */
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px; /* Increased gap for better text/icon separation */
  padding: 9px 18px; /* Slightly more padding */
  border-radius: 12px; /* More rounded corners */
  font-size: 14px;
  font-weight: 600; /* Slightly bolder text */
  cursor: pointer;
  transition: all 0.2s ease;
  border: none; /* Remove border */
  position: relative;
  overflow: hidden;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15); /* Slightly stronger shadow */
}

.action-btn:hover {
  transform: translateY(-1px); /* Slight lift on hover */
}

.action-btn:active {
  transform: scale(0.97) translateY(0);
  box-shadow: none; /* Remove shadow on press */
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-content img {
  width: 18px;
  height: 18px;
}

.btn-text {
  line-height: 1.2; /* Ensure text aligns well */
}

/* --- Upload Button --- */
.upload-btn {
  background-color: #4b96f3; /* Slightly brighter blue */
  color: white;
}

.upload-btn:hover {
  background-color: #5aa2ff; /* Even brighter on hover */
  box-shadow: 0 3px 6px rgba(75, 150, 243, 0.25); /* Colored shadow */
}

/* --- Select Button --- */
.select-btn {
  background-color: #5a6474; /* Slightly lighter gray */
  color: white; /* Full white text for better contrast */
}

.select-btn:hover {
  background-color: #6b7585; /* Lighter on hover */
  box-shadow: 0 3px 6px rgba(107, 117, 133, 0.25); /* Colored shadow */
}

/* --- Delete Button --- */
.delete-btn {
  /* Keeping gradient but maybe less bright */
  background: linear-gradient(145deg, #ef4444, #b91c1c); /* Red 500 to Red 700 */
  color: white;
  border-color: transparent;
}

.delete-btn:hover {
  background: linear-gradient(145deg, #dc2626, #991b1b); /* Red 600 to Red 800 */
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
}

/* --- Cancel Button (Similar to Select) --- */
.cancel-btn {
  background-color: #4B5563; /* Tailwind Gray 600 */
  color: #D1D5DB; /* Tailwind Gray 300 */
  border-color: #4B5563; /* Match background */
}

.cancel-btn:hover {
  background-color: #6B7280; /* Tailwind Gray 500 */
  border-color: #6B7280;
  color: #F9FAFB; /* Tailwind Gray 50 */
  box-shadow: 0 2px 4px rgba(107, 114, 128, 0.2);
}

@media (max-width: 768px) {
  .gallery-controls {
    gap: 8px;
  }

  .action-btn {
    padding: 7px 14px; /* Slightly adjusted mobile padding */
    font-size: 13px;
  }
  
  .btn-content img {
    width: 16px;
    height: 16px;
  }
}
</style> 