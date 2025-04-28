<template>
  <div class="media-viewer" @keyup="handleKeyup" tabindex="0" ref="viewer">
    <div class="viewer-header">
      <button class="close-btn" @click="closeViewer">
        <img :src="baseUrl + 'img/close.svg'" alt="Close" width="22" height="22" />
      </button>
      <div class="file-info" v-if="media">
        <span class="filename">{{ media.originalName }}</span>
        <span class="date">{{ formatDate(media.createdAt) }}</span>
      </div>
      <div class="viewer-actions">
        <theme-toggle />
        <button class="toggle-metadata" @click="toggleMetadata">
          {{ showMetadata ? 'Hide Metadata' : 'Show Metadata' }}
        </button>
      </div>
    </div>
    
    <div class="viewer-content">
      <div 
        v-if="hasPrevious" 
        class="nav-area prev-area"
      >
        <button class="nav-button prev-button" @click="navigateToPrevious">
          <img :src="baseUrl + 'img/arrow-left.svg'" alt="Previous" />
        </button>
      </div>
      
      <div class="media-container" ref="mediaContainer" @contextmenu.prevent>
        <div v-if="loading" class="loading-spinner-container">
          <div class="loading-spinner"></div>
        </div>
        <img 
          v-else-if="isImage" 
          :src="mediaUrl" 
          @load="onMediaLoad" 
          @wheel="handleZoom"
          @mousedown="startPan"
          @touchstart="startTouchPan"
          @touchmove="handleTouchPan"
          @touchend="stopPan"
          @dblclick="handleDoubleClick"
          @dragstart.prevent
          :style="transformStyle"
          class="media-image"
          ref="mediaElement"
          draggable="false"
        />
        <video 
          v-else-if="isVideo" 
          :src="mediaUrl" 
          controls
          @loadeddata="onMediaLoad"
          class="media-video"
          ref="mediaElement"
        ></video>
        <div v-else class="unsupported">Unsupported media type</div>
      </div>
      
      <div 
        v-if="hasNext" 
        class="nav-area next-area"
      >
        <button class="nav-button next-button" @click="navigateToNext">
          <img :src="baseUrl + 'img/arrow-right.svg'" alt="Next" />
        </button>
      </div>
      
      <div v-if="showMetadata && metadata" class="metadata-panel">
        <h3>Metadata</h3>
        <div v-if="isImage && metadata.exif" class="metadata-group">
          <div v-if="metadata.dimensions" class="metadata-item">
            <span class="metadata-label">Dimensions:</span>
            <span class="metadata-value">{{ metadata.dimensions.width }}x{{ metadata.dimensions.height }}</span>
          </div>
          <div v-if="metadata.exif.Make" class="metadata-item">
            <span class="metadata-label">Camera:</span>
            <span class="metadata-value">{{ metadata.exif.Make }} {{ metadata.exif.Model }}</span>
          </div>
          <div v-if="metadata.exif.ExposureTime" class="metadata-item">
            <span class="metadata-label">Exposure:</span>
            <span class="metadata-value">{{ formatExposure(metadata.exif.ExposureTime) }}</span>
          </div>
          <div v-if="metadata.exif.FNumber" class="metadata-item">
            <span class="metadata-label">Aperture:</span>
            <span class="metadata-value">f/{{ metadata.exif.FNumber }}</span>
          </div>
          <div v-if="metadata.exif.ISO" class="metadata-item">
            <span class="metadata-label">ISO:</span>
            <span class="metadata-value">{{ metadata.exif.ISO }}</span>
          </div>
          <div v-if="metadata.exif.FocalLength" class="metadata-item">
            <span class="metadata-label">Focal Length:</span>
            <span class="metadata-value">{{ metadata.exif.FocalLength }}mm</span>
          </div>
        </div>
        <div v-else class="metadata-item">
          <span class="metadata-label">Type:</span>
          <span class="metadata-value">{{ media.type }}</span>
        </div>
        <div class="metadata-item">
          <span class="metadata-label">Size:</span>
          <span class="metadata-value">{{ formatFileSize(media.size) }}</span>
        </div>
        <div class="metadata-item">
          <span class="metadata-label">Created:</span>
          <span class="metadata-value">{{ formatDate(media.createdAt, true) }}</span>
        </div>
        <div class="metadata-item">
          <span class="metadata-label">Uploaded:</span>
          <span class="metadata-value">{{ formatDate(media.uploadedAt, true) }}</span>
        </div>
      </div>
    </div>
    
    <div v-if="isImage" class="zoom-controls">
      <button @click="zoomIn" class="zoom-button zoom-in">+</button>
      <button @click="resetZoom" class="zoom-button zoom-reset">Reset</button>
      <button @click="zoomOut" class="zoom-button zoom-out">−</button>
    </div>
    
    <div class="mobile-nav-buttons">
      <button 
        v-if="hasPrevious" 
        @click="navigateToPrevious" 
        class="mobile-nav-button prev"
      >
        Previous
      </button>
      <button 
        v-if="hasNext" 
        @click="navigateToNext" 
        class="mobile-nav-button next"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script>
import api from '../services/api';
import { format } from 'date-fns';
import ThemeToggle from '../components/ThemeToggle.vue';
import '../styles/ViewMedia.css';
import '../styles/theme.css';

export default {
  name: 'ViewMedia',
  components: {
    ThemeToggle
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      media: null,
      metadata: null,
      loading: true,
      showMetadata: false,
      scale: 1,
      translateX: 0,
      translateY: 0,
      isPanning: false,
      startX: 0,
      startY: 0,
      previousItem: null,
      nextItem: null,
      baseUrl: process.env.BASE_URL || '/'
    };
  },
  computed: {
    mediaUrl() {
      if (!this.media) return '';
      return `http://localhost:3000/api/media/file/${this.media.filename}`;
    },
    isImage() {
      return this.media && this.media.type && this.media.type.startsWith('image/');
    },
    isVideo() {
      return this.media && this.media.type && this.media.type.startsWith('video/');
    },
    transformStyle() {
      return {
        transform: `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`
      };
    },
    hasPrevious() {
      return this.previousItem !== null;
    },
    hasNext() {
      return this.nextItem !== null;
    }
  },
  watch: {
    '$route.params.id': {
      handler(newId) {
        console.log('Route ID changed to:', newId);
        if (newId) {
          this.fetchMediaDetails();
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.$nextTick(() => {
      if (this.$refs.viewer) {
        this.$refs.viewer.focus();
      }
    });
    window.addEventListener('keydown', this.handleKeydown);
    document.addEventListener('mouseup', this.stopPan);
    document.addEventListener('mousemove', this.pan);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('mouseup', this.stopPan);
    document.removeEventListener('mousemove', this.pan);
  },
  methods: {
    async fetchMediaDetails() {
      try {
        this.loading = true;
        console.log('Fetching details for ID:', this.id);
        
        // Reset state
        this.media = null;
        this.metadata = null;
        this.previousItem = null;
        this.nextItem = null;
        
        // First verify the current item exists
        let currentItem;
        try {
          const itemResponse = await api.get(`/media/${this.id}`);
          currentItem = itemResponse.data;
          console.log('Current item verified:', currentItem.originalName);
        } catch (itemError) {
          console.error('Current item not found:', itemError);
          this.$router.push('/');
          return;
        }

        // Store the current item
        this.media = currentItem;

        // Get the metadata
        try {
          const metadataResponse = await api.get(`/metadata/${this.id}`);
          this.metadata = metadataResponse.data;
        } catch (metadataError) {
          console.error('Error fetching metadata:', metadataError);
          // Continue without metadata
        }

        // Fetch neighbors using two API calls with different sort directions
        try {
          // Get items with IDs less than the current item (older items)
          const nextResponse = await api.get(`/media`, {
            params: { 
              lastId: this.id,
              limit: 10,
              sort: -1
            }
          });

          // Get items with IDs greater than the current item (newer items)
          const prevResponse = await api.get(`/media`, {
            params: { 
              lastId: this.id,
              limit: 10,
              sort: 1
            }
          });

          console.log('Previous items:', prevResponse.data.length);
          console.log('Next items:', nextResponse.data.length);

          // Combine the arrays and remove duplicates
          const allItems = [];
          const seenIds = new Set();

          // Add the previous items (newer) first
          const prevItems = [...prevResponse.data].reverse();
          prevItems.forEach(item => {
            if (!seenIds.has(item._id)) {
              allItems.push(item);
              seenIds.add(item._id);
            }
          });

          // Add the current item in the middle
          if (!seenIds.has(this.id)) {
            allItems.push(currentItem);
            seenIds.add(this.id);
          }

          // Add the next items (older)
          nextResponse.data.forEach(item => {
            if (!seenIds.has(item._id)) {
              allItems.push(item);
              seenIds.add(item._id);
            }
          });

          console.log('Combined items:', allItems.length);

          // Find the index of the current item
          const currentIndex = allItems.findIndex(item => item._id.toString() === this.id.toString());

          if (currentIndex > 0) {
            this.previousItem = allItems[currentIndex - 1];
            console.log('Previous item found:', this.previousItem.originalName);
          }
          
          if (currentIndex < allItems.length - 1) {
            this.nextItem = allItems[currentIndex + 1];
            console.log('Next item found:', this.nextItem.originalName);
          }
        } catch (error) {
          console.error('Error fetching neighbor items:', error);
        }
      } catch (error) {
        console.error('Error fetching media details:', error);
        this.$router.push('/');
      } finally {
        this.loading = false;
      }
    },
    onMediaLoad() {
      this.loading = false;
    },
    closeViewer() {
      this.$router.push('/');
    },
    formatDate(dateString, includeTime = false) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return includeTime 
        ? format(date, 'MMM d, yyyy h:mm a')
        : format(date, 'MMM d, yyyy');
    },
    formatFileSize(bytes) {
      if (!bytes) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    formatExposure(exposure) {
      if (!exposure) return '';
      if (exposure < 1) {
        return `1/${Math.round(1/exposure)}`;
      }
      return `${exposure}s`;
    },
    toggleMetadata() {
      this.showMetadata = !this.showMetadata;
    },
    zoomIn() {
      this.scale = Math.min(8, this.scale + 1.0);
      this.constrainBounds();
    },
    zoomOut() {
      this.scale = Math.max(0.5, this.scale - 1.0);
      this.constrainBounds();
    },
    resetZoom() {
      this.scale = 1;
      this.translateX = 0;
      this.translateY = 0;
    },
    constrainBounds() {
      // Only apply constraints if we have the image element and we're zoomed in
      if (!this.$refs.mediaElement || !this.$refs.mediaContainer || this.scale <= 1) {
        // Reset translation if scale is 1 or less
        if (this.scale <= 1) {
          this.translateX = 0;
          this.translateY = 0;
        }
        return;
      }
      
      const img = this.$refs.mediaElement;
      const container = this.$refs.mediaContainer;
      
      // Get dimensions
      const imgRect = img.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      // Calculate the excess width and height
      const excessWidth = Math.max(0, imgRect.width - containerRect.width);
      const excessHeight = Math.max(0, imgRect.height - containerRect.height);
      
      // Calculate the maximum translation values
      const maxTranslateX = excessWidth / 2;
      const maxTranslateY = excessHeight / 2;
      
      // Apply constraints
      this.translateX = Math.min(maxTranslateX, Math.max(-maxTranslateX, this.translateX));
      this.translateY = Math.min(maxTranslateY, Math.max(-maxTranslateY, this.translateY));
    },
    handleZoom(event) {
      if (!this.isImage) return;
      
      event.preventDefault();
      
      // Calculate zoom delta - increased for faster zooming
      const delta = -Math.sign(event.deltaY) * 0.5; // Increased from 0.2 to 0.5
      const oldScale = this.scale;
      const newScale = Math.max(0.5, Math.min(8, this.scale + delta)); // Increased max from 5 to 8
      
      // If scale didn't change, don't proceed
      if (newScale === oldScale) return;

      // Zoom toward cursor position
      if (this.$refs.mediaElement && this.$refs.mediaContainer) {
        const img = this.$refs.mediaElement;
        const imgRect = img.getBoundingClientRect();
        const containerRect = this.$refs.mediaContainer.getBoundingClientRect();

        // Calculate the cursor position relative to the container
        const containerX = event.clientX - containerRect.left;
        const containerY = event.clientY - containerRect.top;

        // Calculate the cursor position relative to the image's current position
        const imgX = containerX - this.translateX;
        const imgY = containerY - this.translateY;

        // Calculate the point on the image where we're zooming
        const pointXRatio = imgX / (imgRect.width / oldScale);
        const pointYRatio = imgY / (imgRect.height / oldScale);

        // Calculate how much the point will move when we zoom
        const newPointX = pointXRatio * (imgRect.width / newScale);
        const newPointY = pointYRatio * (imgRect.height / newScale);

        // Adjust translation to keep the point under the cursor
        this.translateX = containerX - newPointX;
        this.translateY = containerY - newPointY;
        
        // Apply scale after calculating position
        this.scale = newScale;
        
        // Apply constraints after zooming
        this.constrainBounds();
      } else {
        // Fallback for when elements aren't available
        this.scale = newScale;
      }
    },
    startPan(event) {
      if (!this.isImage || this.scale <= 1) return;

      // Prevent default behavior to avoid browser drag behavior
      event.preventDefault();

      this.isPanning = true;
      this.startX = event.clientX - this.translateX;
      this.startY = event.clientY - this.translateY;
    },
    pan(event) {
      if (!this.isPanning) return;

      // Calculate new position
      const newTranslateX = event.clientX - this.startX;
      const newTranslateY = event.clientY - this.startY;

      // Update position - constraints will be applied later
      this.translateX = newTranslateX;
      this.translateY = newTranslateY;

      // Apply constraints while panning for smoother experience
      this.constrainBounds();
    },
    stopPan() {
      this.isPanning = false;

      // Apply constraints after panning stops
      if (this.scale > 1) {
        this.constrainBounds();
      }
    },
    navigateToPrevious() {
      console.log('Navigating to previous item:', this.previousItem?._id);
      if (this.previousItem) {
        // Force a full reload navigation for maximum reliability
        const id = this.previousItem._id;
        window.location.href = `/view/${id}`;
      }
    },
    navigateToNext() {
      console.log('Navigating to next item:', this.nextItem?._id);
      if (this.nextItem) {
        // Force a full reload navigation for maximum reliability
        const id = this.nextItem._id;
        window.location.href = `/view/${id}`;
      }
    },
    handleKeydown(event) {
      console.log('Key pressed:', event.key);

      switch (event.key) {
        case ' ':
          event.preventDefault(); // Prevent scrolling
          if (this.isVideo && this.$refs.mediaElement) {
            const video = this.$refs.mediaElement;
            if (video.paused) {
              video.play();
            } else {
              video.pause();
            }
          } else if (this.isImage) {
            this.resetZoom();
          }
          break;
        case 'Escape':
          this.closeViewer();
          break;
        case 'ArrowLeft':
          if (this.hasPrevious) {
            event.preventDefault();
            this.navigateToPrevious();
          }
          break;
        case 'ArrowRight':
          if (this.hasNext) {
            event.preventDefault();
            this.navigateToNext();
          }
          break;
        // Add keyboard shortcuts for zooming
        case '=':
        case '+':
          if (this.isImage) {
            event.preventDefault();
            this.zoomIn();
          }
          break;
        case '-':
          if (this.isImage) {
            event.preventDefault();
            this.zoomOut();
          }
          break;
        case '0':
          if (this.isImage) {
            event.preventDefault();
            this.resetZoom();
          }
          break;
      }
    },
    handleKeyup(event) {
      switch (event.key) {
        case 'Escape':
          this.closeViewer();
          break;
        case 'ArrowLeft':
          if (this.hasPrevious) {
            this.navigateToPrevious();
          }
          break;
        case 'ArrowRight':
          if (this.hasNext) {
            this.navigateToNext();
          }
          break;
      }
    },
    handleDoubleClick(event) {
      if (!this.isImage) return;
      
      event.preventDefault();
      
      // Toggle between normal and zoomed view
      if (this.scale > 1.5) {
        // If already zoomed, reset to normal
        this.resetZoom();
      } else {
        // Use a fixed zoom level on double-click for quick zooming
        const targetScale = 3.0;
        const oldScale = this.scale;
        
        // Only proceed if the scale is actually changing
        if (targetScale === oldScale) return;
        
        // Zoom toward the cursor position
        if (this.$refs.mediaElement && this.$refs.mediaContainer) {
          const img = this.$refs.mediaElement;
          const imgRect = img.getBoundingClientRect();
          const containerRect = this.$refs.mediaContainer.getBoundingClientRect();
          
          // Calculate the cursor position relative to the container
          const containerX = event.clientX - containerRect.left;
          const containerY = event.clientY - containerRect.top;
          
          // Calculate the cursor position relative to the image's current position
          const imgX = containerX - this.translateX;
          const imgY = containerY - this.translateY;
          
          // Calculate the point on the image where we're zooming
          const pointXRatio = imgX / (imgRect.width / oldScale);
          const pointYRatio = imgY / (imgRect.height / oldScale);
          
          // Calculate how much the point will move when we zoom
          const newPointX = pointXRatio * (imgRect.width / targetScale);
          const newPointY = pointYRatio * (imgRect.height / targetScale);
          
          // Adjust translation to keep the point under the cursor
          this.translateX = containerX - newPointX;
          this.translateY = containerY - newPointY;
          
          // Apply scale after calculating position
          this.scale = targetScale;
          
          // Apply constraints after zooming
          this.constrainBounds();
        } else {
          // Fallback for when elements aren't available
          this.scale = targetScale;
        }
      }
    },
    startTouchPan(event) {
      if (!this.isImage || this.scale <= 1) return;
      
      // Prevent default behavior to avoid browser drag behavior
      event.preventDefault();
      
      this.isPanning = true;
      this.startX = event.touches[0].clientX - this.translateX;
      this.startY = event.touches[0].clientY - this.translateY;
    },
    handleTouchPan(event) {
      if (!this.isPanning) return;
      
      // Calculate new position
      const newTranslateX = event.touches[0].clientX - this.startX;
      const newTranslateY = event.touches[0].clientY - this.startY;
      
      // Update position - constraints will be applied later
      this.translateX = newTranslateX;
      this.translateY = newTranslateY;
      
      // Apply constraints while panning for smoother experience
      this.constrainBounds();
    }
  }
};
</script>

<style scoped>
/* CSS moved to external file */
</style> 