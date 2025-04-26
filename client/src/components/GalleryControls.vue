<template>
  <div v-if="showControls" class="gallery-controls">
    <button 
      v-if="!isSelecting" 
      @click="uploadMedia" 
      class="action-btn upload-btn" 
      title="Upload Media"
    >
      <span class="btn-content">
        <img :src="baseUrl + 'img/upload-icon.svg'" alt="Upload" width="18" height="18" />
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
        <img :src="baseUrl + 'img/checkbox-icon.svg'" alt="Select" width="18" height="18" />
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
        <img :src="baseUrl + 'img/delete-icon.svg'" alt="Delete" width="18" height="18" />
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
        <img :src="baseUrl + 'img/close.svg'" alt="Cancel" width="18" height="18" />
        <span class="btn-text">Cancel</span>
      </span>
    </button>
  </div>
</template>

<script>
import { computed, inject, onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';

export default {
  name: 'GalleryControls',
  setup() {
    const route = useRoute();
    const showControls = computed(() => route.path === '/');
    const baseUrl = process.env.BASE_URL || '/';

    // Try to inject gallery controls, they might not be available if not in Gallery
    const galleryControls = inject('galleryControls', null);
    const isSelecting = ref(false);
    const selectedCount = ref(0);

    const uploadMedia = () => {
      if (galleryControls?.openUploadModal) {
        galleryControls.openUploadModal();
      }
    };

    const startSelection = () => {
      if (galleryControls?.toggleSelectMode) {
        galleryControls.toggleSelectMode();
      }
    };

    const deleteSelected = () => {
      if (galleryControls?.deleteSelected) {
        galleryControls.deleteSelected();
      }
    };

    const cancelSelection = () => {
      if (galleryControls?.toggleSelectMode) {
        galleryControls.toggleSelectMode();
      }
    };

    // Event listener for selection changes from Gallery
    const handleSelectionUpdate = (detail) => {
      isSelecting.value = detail.isSelecting;
      selectedCount.value = detail.selectedCount;
    };

    onMounted(() => {
      window.addEventListener('gallery-selection-update', (event) => {
        handleSelectionUpdate(event.detail);
      });
    });

    onUnmounted(() => {
      window.removeEventListener('gallery-selection-update', handleSelectionUpdate);
    });

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
  gap: 8px;
  align-items: center;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, opacity 0.2s;
  color: var(--color-text-primary);
  background-color: var(--color-hover, #f1f5f9);
  height: 32px;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-btn img {
  width: 18px;
  height: 18px;
  display: block;
  color: currentColor;
}

.upload-btn {
  background-color: var(--color-primary, #3b82f6);
  color: white;
}

.upload-btn:hover {
  background-color: var(--color-primary-dark, #2563eb);
}

.select-btn:hover {
  background-color: rgba(var(--color-hover-rgb, 241, 245, 249), 0.8);
}

.delete-btn {
  background-color: var(--color-error, #ef4444);
  color: white;
}

.delete-btn:hover {
  opacity: 0.9;
}

.cancel-btn:hover {
  background-color: rgba(var(--color-hover-rgb, 241, 245, 249), 0.8);
}

@media (max-width: 768px) {
  .action-btn {
    padding: 6px 8px;
  }
  
  .btn-text {
    display: none;
  }
  
  .gallery-controls {
    gap: 4px;
  }
}
</style> 