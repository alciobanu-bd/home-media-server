<template>
  <div class="gallery" ref="galleryContainer">
    <div v-if="loading && !media.length" class="loading">
      Loading...
    </div>
    
    <div v-else-if="!media.length" class="empty-gallery">
      No media items yet. Click "Upload" to add some!
    </div>
    
    <div v-else class="media-grid">
      <div v-for="(group, date) in groupedMedia" :key="date" class="date-group">
        <h2 class="date-header">{{ formatDate(date) }}</h2>
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
  </div>
</template>

<script>
import axios from 'axios';
import { format } from 'date-fns';
import MediaItem from '../components/MediaItem.vue';
import UploadModal from '../components/UploadModal.vue';
import ConfirmationDialog from '../components/ConfirmationDialog.vue';
import '../styles/Gallery.css';
import '../styles/theme.css';
import galleryControlsStore from '../store/galleryControlsStore';

export default {
  name: 'Gallery',
  components: {
    MediaItem,
    UploadModal,
    ConfirmationDialog
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
      baseUrl: process.env.BASE_URL || '/'
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
      deleteSelected: this.deleteSelected
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
        const response = await axios.get('http://localhost:3000/api/media', {
          params: {
            lastId: this.lastId,
            limit: 50
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
          await axios.delete(`http://localhost:3000/api/${this.itemToDelete._id}`);
          this.media = this.media.filter(item => item._id !== this.itemToDelete._id);
          this.itemToDelete = null;
        } else {
          // Delete multiple items
          await Promise.all(
            this.selectedItems.map(id => 
              axios.delete(`http://localhost:3000/api/${id}`)
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
    }
  }
};
</script> 