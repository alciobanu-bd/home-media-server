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
  gap: 12px; /* Consistent gap */
}

/* Base button style - applying globally for consistency */
.button {
  display: inline-flex; /* Use inline-flex for alignment */
  align-items: center;
  justify-content: center;
  gap: 6px; /* Gap between icon and text */
  padding: 8px 14px; /* Adjusted padding */
  border: 1px solid transparent;
  border-radius: var(--border-radius);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--base-transition);
  white-space: nowrap; /* Prevent wrapping */
  line-height: 1.5; /* Ensure consistent height */
}

.button svg {
  width: 18px; /* Control icon size */
  height: 18px;
  fill: currentColor; /* Make SVG color inherit */
}

/* Primary button style */
.button.primary {
  background-color: var(--color-primary);
  color: var(--color-button-text, white);
  border-color: var(--color-primary);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.button.primary:hover {
  background-color: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.08);
}

.button.primary:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* Secondary button style */
.button.secondary {
  background-color: var(--color-bg-primary);
  color: var(--color-text-secondary);
  border-color: var(--color-border);
}

.button.secondary:hover {
  background-color: var(--color-hover);
  border-color: var(--color-border);
  color: var(--color-text-primary);
}

/* Danger button style */
.button.danger {
  background-color: var(--color-error);
  color: white;
  border-color: var(--color-error);
}

.button.danger:hover {
  background-color: var(--color-error-dark);
  border-color: var(--color-error-dark);
  transform: translateY(-1px);
}

/* Disabled state */
.button:disabled {
  background-color: var(--color-button-disabled);
  border-color: var(--color-button-disabled);
  color: var(--color-text-secondary);
  opacity: 0.6;
  cursor: not-allowed;
  transform: translateY(0);
  box-shadow: none;
}

/* Specific adjustments for controls */
.upload-button {
  /* Uses .button.primary styles */
}

.selection-actions {
  display: flex;
  align-items: center;
  gap: 8px; /* Inner gap for selection buttons */
}

.select-button,
.cancel-button,
.delete-button {
   /* Uses .button.secondary styles */
}

.delete-button {
  /* Uses .button.danger styles */
  margin-left: 4px; /* Add slight space before delete */
}

.selected-count {
  font-size: 13px;
  color: var(--color-text-secondary);
  font-weight: 500;
  margin-left: 8px; /* Space before count */
  background-color: var(--color-hover);
  padding: 4px 8px;
  border-radius: var(--border-radius);
}

/* Remove default browser styles for file input */
input[type="file"] {
  display: none;
}

@media (max-width: 768px) {
  .gallery-controls {
    gap: 8px; /* Reduced gap */
  }

  .button {
    padding: 6px 10px; /* Smaller padding */
    font-size: 13px;
  }

  .button svg {
    width: 16px;
    height: 16px;
  }
  
  .selection-actions {
    gap: 6px;
  }

  .selected-count {
     display: none; /* Hide count on small screens maybe? Or adjust styling */
  }
}
</style> 