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
  gap: 10px;
  align-items: center;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--border-radius);
  padding: 6px 16px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-speed) ease;
  color: var(--color-text-primary);
  background-color: var(--color-hover, #f1f5f9);
  height: 36px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  min-width: 100px;
  white-space: nowrap;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 1;
  justify-content: center;
  width: 100%;
}

.action-btn img {
  width: 20px;
  height: 20px;
  display: block;
  color: currentColor;
  transition: transform var(--transition-speed) ease;
  flex-shrink: 0;
}

.action-btn:hover img {
  transform: scale(1.1);
}

.btn-text {
  transition: transform var(--transition-speed) ease;
  font-weight: 500;
}

.action-btn:hover .btn-text {
  transform: translateX(2px);
}

.upload-btn {
  background-color: var(--color-primary, #3b82f6);
  color: white;
}

.upload-btn:hover {
  background-color: var(--color-primary-dark, #2563eb);
}

.upload-btn:before {
  content: '';
  position: absolute;
  top: 0;
  left: -50%;
  width: 150%;
  height: 100%;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: translateX(-100%);
  transition: transform 0.8s ease;
}

.upload-btn:hover:before {
  transform: translateX(100%);
}

.select-btn {
  background-color: rgba(var(--color-hover-rgb, 241, 245, 249), 0.6);
}

.select-btn:hover {
  background-color: rgba(var(--color-hover-rgb, 241, 245, 249), 1);
}

.delete-btn {
  background-color: var(--color-error, #ef4444);
  color: white;
  min-width: 110px;
}

.delete-btn:hover {
  background-color: var(--color-error-dark, #dc2626);
}

.cancel-btn {
  background-color: rgba(var(--color-hover-rgb, 241, 245, 249), 0.6);
}

.cancel-btn:hover {
  background-color: rgba(var(--color-hover-rgb, 241, 245, 249), 1);
}

@media (max-width: 768px) {
  .action-btn {
    padding: 6px 10px;
    height: 34px;
    min-width: 40px;
  }
  
  .btn-text {
    display: none;
  }
  
  .gallery-controls {
    gap: 6px;
  }
  
  .action-btn img {
    width: 18px;
    height: 18px;
    margin: 0 auto;
  }
}
</style> 