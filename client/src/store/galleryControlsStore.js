import { reactive, readonly } from 'vue';

// Create a reactive state
const state = reactive({
  isSelecting: false,
  selectedCount: 0,
  galleryInstance: null
});

// Register callbacks
let openUploadModalCallback = null;
let toggleSelectModeCallback = null;
let deleteSelectedCallback = null;
let addToAlbumCallback = null;
let shareToCirclesCallback = null;

// Actions
const actions = {
  /**
   * Register the gallery component's callbacks
   */
  registerGallery(callbacks) {
    openUploadModalCallback = callbacks.openUploadModal;
    toggleSelectModeCallback = callbacks.toggleSelectMode;
    deleteSelectedCallback = callbacks.deleteSelected;
    addToAlbumCallback = callbacks.addToAlbum;
    shareToCirclesCallback = callbacks.shareToCircles;
    state.galleryInstance = true;
  },

  /**
   * Unregister the gallery component
   */
  unregisterGallery() {
    openUploadModalCallback = null;
    toggleSelectModeCallback = null;
    deleteSelectedCallback = null;
    addToAlbumCallback = null;
    shareToCirclesCallback = null;
    state.galleryInstance = null;
    state.isSelecting = false;
    state.selectedCount = 0;
  },

  /**
   * Update selection state
   */
  updateSelectionState(isSelecting, selectedCount) {
    state.isSelecting = isSelecting;
    state.selectedCount = selectedCount;
  },

  /**
   * Call the openUploadModal method on the gallery
   */
  openUploadModal() {
    if (openUploadModalCallback) {
      openUploadModalCallback();
    }
  },

  /**
   * Call the toggleSelectMode method on the gallery
   */
  toggleSelectMode() {
    if (toggleSelectModeCallback) {
      toggleSelectModeCallback();
    }
  },

  /**
   * Call the deleteSelected method on the gallery
   */
  deleteSelected() {
    if (deleteSelectedCallback) {
      deleteSelectedCallback();
    }
  },
  
  /**
   * Call the addToAlbum method on the gallery
   */
  addToAlbum() {
    console.log('galleryControlsStore - addToAlbum called', !!addToAlbumCallback);
    if (addToAlbumCallback) {
      addToAlbumCallback();
    }
  },
  
  /**
   * Call the shareToCircles method on the gallery
   */
  shareToCircles() {
    if (shareToCirclesCallback) {
      shareToCirclesCallback();
    }
  }
};

// Export readonly state and actions
export default {
  state: readonly(state),
  ...actions
}; 