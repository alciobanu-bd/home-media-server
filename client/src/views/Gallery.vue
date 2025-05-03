<template>
  <div class="gallery" ref="galleryContainer">
    <!-- Gallery Header -->
    <div class="gallery-header">
      <div>
        <h1>Your Media Gallery</h1>
        <p class="gallery-description">Browse all the photos and videos you've uploaded to Lumia</p>
      </div>
    </div>

    <div v-if="loading && !media.length" class="loading">
      Loading...
    </div>
    
    <div v-else-if="!media.length" class="empty-gallery">
      No media items yet. Click "Upload" to add some!
    </div>
    
    <div v-else class="media-grid">
      <div v-for="(group, date) in groupedMedia" :key="date" class="date-group">
        <h2 class="date-header">
          {{ formatDate(date) }}
          <button
            class="day-select-btn"
            @click.prevent="handleDaySelect(date)"
            title="Select all items from this day"
          >
            Select Day
          </button>
        </h2>
        <div class="grid">
          <media-item 
            v-for="item in group" 
            :key="item._id"
            :item="item" 
            :select-mode="selectMode"
            :selected="selectedItems.includes(item._id)"
            :selection-index="selectedItems.indexOf(item._id)"
            @click="handleItemClick(item)"
            @select="toggleSelect(item)"
            @delete="deleteItem(item)"
          />
        </div>
      </div>
    </div>

    <div v-if="hasMore" class="loading-indicator" ref="loadingIndicator">
      <div v-if="loading" class="loading-spinner">Loading more items...</div>
    </div>

    <upload-modal v-if="showUploadModal" @close="closeUploadModal" />
    
    <confirmation-dialog 
      v-if="showDeleteConfirmation" 
      :message="deleteConfirmMessage"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
    
    <album-selector-modal
      v-if="showAlbumSelector"
      :mediaIds="selectedItems"
      @close="closeAlbumSelector"
      @saved="handleAddToAlbumSuccess"
    />
    
    <circle-selector-modal
      v-if="showCircleSelector"
      :mediaIds="selectedItems"
      @close="closeCircleSelector"
      @saved="handleShareToCirclesSuccess"
    />
  </div>
</template>

<script>
import api from '../services/api';
import { format } from 'date-fns';
import MediaItem from '../components/MediaItem.vue';
import UploadModal from '../components/UploadModal.vue';
import ConfirmationDialog from '../components/ConfirmationDialog.vue';
import AlbumSelectorModal from '../components/AlbumSelectorModal.vue';
import CircleSelectorModal from '../components/CircleSelectorModal.vue';
import '../styles/Gallery.css';
import '../styles/theme.css';
import galleryControlsStore from '../store/galleryControlsStore';

export default {
  name: 'Gallery',
  components: {
    MediaItem,
    UploadModal,
    ConfirmationDialog,
    AlbumSelectorModal,
    CircleSelectorModal
  },
  data() {
    return {
      media: [],
      loading: true,
      lastId: null,
      hasMore: true,
      showUploadModal: false,
      selectMode: false,
      selectedItems: [],
      showDeleteConfirmation: false,
      deleteConfirmMessage: '',
      itemToDelete: null,
      observer: null,
      observerThreshold: 0.3, // Load more when 30% of the loading indicator is visible
      baseUrl: process.env.BASE_URL || '/',
      showAlbumSelector: false,
      showCircleSelector: false
    };
  },
  computed: {
    groupedMedia() {
      const groups = {};
      this.media.forEach(item => {
        const date = new Date(item.createdAt).toISOString().split('T')[0];
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(item);
      });
      
      // Sort dates in descending order
      return Object.keys(groups)
        .sort((a, b) => new Date(b) - new Date(a))
        .reduce((obj, key) => {
          obj[key] = groups[key];
          return obj;
        }, {});
    }
  },
  mounted() {
    // Initialize the intersection observer for infinite scrolling
    this.setupInfiniteScroll();
    
    // Register gallery controls with the store
    galleryControlsStore.registerGallery({
      openUploadModal: this.openUploadModal,
      toggleSelectMode: this.toggleSelectMode,
      deleteSelected: this.deleteSelected,
      addToAlbum: this.addToAlbum,
      shareToCircles: this.shareToCircles
    });
    
    // Set document title
    document.title = 'Lumia';
  },
  created() {
    this.fetchMedia();
    
    // Listen for upload completion event
    window.addEventListener('upload-completed', this.handleUploadCompleted);
  },
  beforeUnmount() {
    window.removeEventListener('upload-completed', this.handleUploadCompleted);
    
    // Unregister gallery controls
    galleryControlsStore.unregisterGallery();
    
    // Disconnect the observer to prevent memory leaks
    if (this.observer) {
      this.observer.disconnect();
    }
  },
  methods: {
    setupInfiniteScroll() {
      // Wait for the component to render
      this.$nextTick(() => {
        // Create a new Intersection Observer
        this.observer = new IntersectionObserver(this.handleIntersection, {
          root: null, // Use the viewport as root
          rootMargin: '0px',
          threshold: this.observerThreshold // Trigger when 30% of the element is visible
        });
        
        // Start observing the loading indicator element
        if (this.$refs.loadingIndicator) {
          this.observer.observe(this.$refs.loadingIndicator);
        }
      });
    },
    
    handleIntersection(entries) {
      // If the loading indicator is intersecting with the viewport
      if (entries[0].isIntersecting && !this.loading && this.hasMore) {
        this.loadMore();
      }
    },
    
    async fetchMedia() {
      try {
        this.loading = true;
        const response = await api.get('/media', {
          params: {
            lastId: this.lastId,
            limit: 50,
            sort: -1
          }
        });
        
        if (response.data.length === 0) {
          this.hasMore = false;
        } else {
          this.media = [...this.media, ...response.data];
          this.lastId = response.data[response.data.length - 1]._id;
        }
      } catch (error) {
        console.error('Error fetching media:', error);
      } finally {
        this.loading = false;
        
        // Re-setup the intersection observer if needed
        if (this.hasMore && !this.observer && this.$refs.loadingIndicator) {
          this.setupInfiniteScroll();
        }
      }
    },
    
    loadMore() {
      if (!this.loading && this.hasMore) {
        this.fetchMedia();
      }
    },
    formatDate(dateStr) {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      if (dateStr === today) {
        return 'Today';
      } else if (dateStr === yesterday) {
        return 'Yesterday';
      } else {
        return format(new Date(dateStr), 'MMMM d, yyyy');
      }
    },
    openUploadModal() {
      this.showUploadModal = true;
      document.addEventListener('keydown', this.handleEscKey);
    },
    closeUploadModal() {
      this.showUploadModal = false;
      document.removeEventListener('keydown', this.handleEscKey);
    },
    handleEscKey(event) {
      if (event.key === 'Escape') {
        this.closeUploadModal();
      }
    },
    handleItemClick(item) {
      if (!this.selectMode) {
        this.$router.push({ name: 'ViewMedia', params: { id: item._id } });
      }
    },
    toggleSelectMode() {
      this.selectMode = !this.selectMode;
      if (!this.selectMode) {
        this.selectedItems = [];
      }
      
      // Update gallery controls store
      galleryControlsStore.updateSelectionState(this.selectMode, this.selectedItems.length);
    },
    toggleSelect(item) {
      // Check if item is an object or just an ID string
      const itemId = typeof item === 'object' ? item._id : item;
      
      const index = this.selectedItems.indexOf(itemId);
      if (index === -1) {
        this.selectedItems.push(itemId);
      } else {
        this.selectedItems.splice(index, 1);
      }
      
      // Update gallery controls store
      galleryControlsStore.updateSelectionState(this.selectMode, this.selectedItems.length);
    },
    handleDaySelect(date) {
      // Enable select mode if it's off
      if (!this.selectMode) {
        this.toggleSelectMode();
      }
      // Add all items from the day to selection without duplicates
      const dayItems = this.groupedMedia[date] || [];
      dayItems.forEach(item => {
        if (!this.selectedItems.includes(item._id)) {
          this.selectedItems.push(item._id);
        }
      });
      // Update selection state in store
      galleryControlsStore.updateSelectionState(this.selectMode, this.selectedItems.length);
    },
    deleteItem(item) {
      this.itemToDelete = item;
      this.deleteConfirmMessage = `Are you sure you want to delete "${item.originalName}"?`;
      this.showDeleteConfirmation = true;
    },
    deleteSelected() {
      if (this.selectedItems.length === 0) return;
      
      this.deleteConfirmMessage = `Are you sure you want to delete ${this.selectedItems.length} selected item(s)?`;
      this.showDeleteConfirmation = true;
    },
    async confirmDelete() {
      try {
        if (this.itemToDelete) {
          // Delete single item
          await api.delete(`/${this.itemToDelete._id}`);
          this.media = this.media.filter(item => item._id !== this.itemToDelete._id);
          this.itemToDelete = null;
        } else {
          // Delete multiple items
          await Promise.all(
            this.selectedItems.map(id => 
              api.delete(`/${id}`)
            )
          );
          this.media = this.media.filter(item => !this.selectedItems.includes(item._id));
          this.selectedItems = [];
          this.toggleSelectMode();
        }
      } catch (error) {
        console.error('Error deleting items:', error);
        alert('Failed to delete one or more items.');
      } finally {
        this.showDeleteConfirmation = false;
      }
    },
    cancelDelete() {
      this.showDeleteConfirmation = false;
      this.itemToDelete = null;
    },
    handleUploadCompleted() {
      // Refresh the gallery
      this.media = [];
      this.lastId = null;
      this.hasMore = true;
      this.fetchMedia();
    },
    addToAlbum() {
      console.log('Gallery - addToAlbum called', this.selectedItems.length);
      if (this.selectedItems.length === 0) return;
      console.log('Setting showAlbumSelector to true');
      
      // Force a refresh of the flag if it's already true in case of stale state
      if (this.showAlbumSelector) {
        this.showAlbumSelector = false;
        this.$nextTick(() => {
          this.showAlbumSelector = true;
        });
      } else {
        this.showAlbumSelector = true;
      }
    },
    closeAlbumSelector() {
      this.showAlbumSelector = false;
    },
    handleAddToAlbumSuccess(result) {
      console.log('Album addition success:', result);
      // Optionally show a success message or notification
      this.showAlbumSelector = false;
      
      // Exit select mode or show a success message
      this.toggleSelectMode();
      
      // Show toast notification (if you have a notification system)
      alert(`Added ${result.mediaIds.length} items to ${result.albumIds.length} album(s).`);
    },
    shareToCircles() {
      if (this.selectedItems.length === 0) return;
      
      // Force a refresh of the flag if it's already true in case of stale state
      if (this.showCircleSelector) {
        this.showCircleSelector = false;
        this.$nextTick(() => {
          this.showCircleSelector = true;
        });
      } else {
        this.showCircleSelector = true;
      }
    },
    closeCircleSelector() {
      this.showCircleSelector = false;
    },
    handleShareToCirclesSuccess(result) {
      console.log('Circle sharing success:', result);
      this.showCircleSelector = false;
      
      // Exit select mode or show a success message
      this.toggleSelectMode();
      
      // Show toast notification
      const successMessage = result.failedCount > 0 
        ? `Shared ${result.successCount} out of ${result.mediaIds.length} items with ${result.circleIds.length} circle(s). ${result.failedCount} failed.`
        : `Shared ${result.mediaIds.length} items with ${result.circleIds.length} circle(s).`;
      
      alert(successMessage);
    }
  },
  watch: {
    selectMode(newVal) {
      // Add/remove body class based on select mode
      if (newVal) {
        document.body.classList.add('selection-active');
      } else {
        document.body.classList.remove('selection-active');
      }
    },
    selectedItems: {
      handler(newVal) {
        console.log('selectedItems changed:', newVal.length);
        // Update gallery controls store
        galleryControlsStore.updateSelectionState(this.selectMode, newVal.length);
      },
      deep: true
    }
  }
};
</script>

<style>
/* Add styles for the gallery header */
.gallery-header {
  padding: 0 24px 24px 24px; /* Match padding of other content */
  margin-bottom: 16px;
  /* Remove border-bottom */
}

.gallery-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text-primary);
  /* Use the Lumia purple-green gradient */
  background: linear-gradient(90deg, var(--lumia-purple), var(--lumia-green));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text; /* For better browser compatibility */
  font-family: 'Poppins', sans-serif;
  margin-bottom: 4px; /* Match Albums page */
}

.gallery-description {
  font-size: 15px;
  color: var(--color-text-secondary);
  margin: 0;
  max-width: 800px; /* Slightly wider than before */
}

/* Ensure existing styles are scoped or global */
</style> 