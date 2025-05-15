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
        <button class="toggle-metadata" :class="{ 'active': showMetadata }" @click="toggleMetadata">
          {{ showMetadata ? 'Hide Metadata' : 'Show Metadata' }}
        </button>
      </div>
    </div>
    
    <div class="viewer-content" :class="{ 'with-metadata': showMetadata }">
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
        
        <!-- Move navigation arrows inside media container -->
        <div 
          v-if="hasPrevious" 
          class="nav-area prev-area"
        >
          <button class="nav-button prev-button" @click="navigateToPrevious">
            <img :src="baseUrl + 'img/arrow-left.svg'" alt="Previous" />
          </button>
        </div>
        
        <div 
          v-if="hasNext" 
          class="nav-area next-area"
        >
          <button class="nav-button next-button" @click="navigateToNext">
            <img :src="baseUrl + 'img/arrow-right.svg'" alt="Next" />
          </button>
        </div>
      </div>
      
      <div v-show="showMetadata" class="metadata-panel" :class="{ 'visible': showMetadata }">
        <h3>Metadata</h3>
        
        <!-- File Basic Info -->
        <div class="metadata-group">
          <h4>File Information</h4>
          <div v-if="media" class="metadata-item">
            <span class="metadata-label">Filename:</span>
            <span class="metadata-value">{{ media.originalName }}</span>
          </div>
          <div v-if="media" class="metadata-item">
            <span class="metadata-label">Type:</span>
            <span class="metadata-value">{{ media.type }}</span>
          </div>
          <div v-if="media" class="metadata-item">
            <span class="metadata-label">Size:</span>
            <span class="metadata-value">{{ formatFileSize(media.size) }}</span>
          </div>
          <div v-if="metadata && metadata.dimensions" class="metadata-item">
            <span class="metadata-label">Dimensions:</span>
            <span class="metadata-value">{{ metadata.dimensions.width }}x{{ metadata.dimensions.height }}</span>
          </div>
        </div>
        
        <!-- Creation and Upload Times -->
        <div class="metadata-group">
          <h4>Dates</h4>
          <div v-if="metadata && metadata.exif && metadata.exif.DateTimeOriginal" class="metadata-item">
            <span class="metadata-label">Captured:</span>
            <span class="metadata-value">{{ formatDate(new Date(metadata.exif.DateTimeOriginal * 1000), true) }}</span>
          </div>
          <div v-if="media" class="metadata-item">
            <span class="metadata-label">Created:</span>
            <span class="metadata-value">{{ formatDate(media.createdAt, true) }}</span>
          </div>
          <div v-if="media" class="metadata-item">
            <span class="metadata-label">Uploaded:</span>
            <span class="metadata-value">{{ formatDate(media.uploadedAt, true) }}</span>
          </div>
        </div>
        
        <!-- Camera Information (for images with EXIF data) -->
        <div v-if="isImage && metadata && metadata.exif" class="metadata-group">
          <h4>Camera Information</h4>
          <div v-if="metadata.exif.Make || metadata.exif.Model" class="metadata-item">
            <span class="metadata-label">Camera:</span>
            <span class="metadata-value">{{ metadata.exif.Make }} {{ metadata.exif.Model }}</span>
          </div>
          <div v-if="metadata.exif.LensMake || metadata.exif.LensModel" class="metadata-item">
            <span class="metadata-label">Lens:</span>
            <span class="metadata-value">{{ metadata.exif.LensMake || '' }} {{ metadata.exif.LensModel || '' }}</span>
          </div>
          <div v-if="metadata.exif.FocalLength" class="metadata-item">
            <span class="metadata-label">Focal Length:</span>
            <span class="metadata-value">{{ metadata.exif.FocalLength }}mm</span>
          </div>
          <div v-if="metadata.exif.FocalLengthIn35mmFormat" class="metadata-item">
            <span class="metadata-label">35mm Equivalent:</span>
            <span class="metadata-value">{{ metadata.exif.FocalLengthIn35mmFormat }}mm</span>
          </div>
        </div>
        
        <!-- Exposure Information (for images with EXIF data) -->
        <div v-if="isImage && metadata && metadata.exif" class="metadata-group">
          <h4>Exposure Information</h4>
          <div v-if="metadata.exif.ExposureTime" class="metadata-item">
            <span class="metadata-label">Shutter Speed:</span>
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
          <div v-if="metadata.exif.ExposureProgram" class="metadata-item">
            <span class="metadata-label">Exposure Program:</span>
            <span class="metadata-value">{{ formatExposureProgram(metadata.exif.ExposureProgram) }}</span>
          </div>
          <div v-if="metadata.exif.ExposureMode" class="metadata-item">
            <span class="metadata-label">Exposure Mode:</span>
            <span class="metadata-value">{{ formatExposureMode(metadata.exif.ExposureMode) }}</span>
          </div>
          <div v-if="metadata.exif.ExposureBiasValue !== undefined" class="metadata-item">
            <span class="metadata-label">Exposure Bias:</span>
            <span class="metadata-value">{{ formatExposureBias(metadata.exif.ExposureBiasValue) }}</span>
          </div>
          <div v-if="metadata.exif.MeteringMode" class="metadata-item">
            <span class="metadata-label">Metering Mode:</span>
            <span class="metadata-value">{{ formatMeteringMode(metadata.exif.MeteringMode) }}</span>
          </div>
          <div v-if="metadata.exif.Flash !== undefined" class="metadata-item">
            <span class="metadata-label">Flash:</span>
            <span class="metadata-value">{{ formatFlashMode(metadata.exif.Flash) }}</span>
          </div>
          <div v-if="metadata.exif.WhiteBalance" class="metadata-item">
            <span class="metadata-label">White Balance:</span>
            <span class="metadata-value">{{ formatWhiteBalance(metadata.exif.WhiteBalance) }}</span>
          </div>
        </div>
        
        <!-- Location Information -->
        <div v-if="hasGeoLocationData && metadata" class="metadata-group">
          <h4>Location</h4>
          <geo-location-map :gps-data="metadata.exif"></geo-location-map>
        </div>
        
        <!-- Advanced EXIF Data (for the tech-savvy) -->
        <div v-if="isImage && metadata && metadata.exif && hasAdvancedExif" class="metadata-group">
          <h4 class="collapsible" @click="toggleAdvancedExif">
            Advanced Data
            <span class="toggle-icon">{{ showAdvancedExif ? '−' : '+' }}</span>
          </h4>
          <div v-show="showAdvancedExif" class="advanced-metadata">
            <div v-if="metadata.exif.Software" class="metadata-item">
              <span class="metadata-label">Software:</span>
              <span class="metadata-value">{{ metadata.exif.Software }}</span>
            </div>
            <div v-if="metadata.exif.ColorSpace" class="metadata-item">
              <span class="metadata-label">Color Space:</span>
              <span class="metadata-value">{{ formatColorSpace(metadata.exif.ColorSpace) }}</span>
            </div>
            <div v-if="metadata.exif.Orientation" class="metadata-item">
              <span class="metadata-label">Orientation:</span>
              <span class="metadata-value">{{ metadata.exif.Orientation }}</span>
            </div>
            <div v-if="metadata.exif.XResolution" class="metadata-item">
              <span class="metadata-label">X Resolution:</span>
              <span class="metadata-value">{{ metadata.exif.XResolution }} dpi</span>
            </div>
            <div v-if="metadata.exif.YResolution" class="metadata-item">
              <span class="metadata-label">Y Resolution:</span>
              <span class="metadata-value">{{ metadata.exif.YResolution }} dpi</span>
            </div>
            <div v-if="metadata.exif.SceneCaptureType" class="metadata-item">
              <span class="metadata-label">Scene Type:</span>
              <span class="metadata-value">{{ formatSceneType(metadata.exif.SceneCaptureType) }}</span>
            </div>
            <div v-if="metadata.exif.SubjectDistance" class="metadata-item">
              <span class="metadata-label">Subject Distance:</span>
              <span class="metadata-value">{{ metadata.exif.SubjectDistance }} m</span>
            </div>
            <div v-if="metadata.exif.DigitalZoomRatio && metadata.exif.DigitalZoomRatio > 1" class="metadata-item">
              <span class="metadata-label">Digital Zoom:</span>
              <span class="metadata-value">{{ metadata.exif.DigitalZoomRatio }}x</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="isImage" class="zoom-controls">
      <button @click="zoomIn" class="zoom-button zoom-in">+</button>
      <button @click="resetZoom" class="zoom-button zoom-reset">Reset</button>
      <button @click="zoomOut" class="zoom-button zoom-out">−</button>
    </div>
  </div>
</template>

<script>
import api from '../services/api';
import { format } from 'date-fns';
import ThemeToggle from '../components/ThemeToggle.vue';
import GeoLocationMap from '../components/GeoLocationMap.vue';
import '../styles/ViewMedia.css';
import '../styles/theme.css';

export default {
  name: 'ViewMedia',
  components: {
    ThemeToggle,
    GeoLocationMap
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
      showMetadata: this.getStoredMetadataSetting(),
      scale: 1,
      translateX: 0,
      translateY: 0,
      isPanning: false,
      startX: 0,
      startY: 0,
      previousItem: null,
      nextItem: null,
      baseUrl: process.env.BASE_URL || '/',
      albumId: null,
      albumItems: [],
      showAdvancedExif: false,
      circleId: null,
      circleActiveTab: null
    };
  },
  computed: {
    mediaUrl() {
      if (!this.media) return '';
      return `/api/media/file/${this.media.filename}`;
    },
    isImage() {
      return this.media && this.media.type && this.media.type.startsWith('image/');
    },
    isVideo() {
      return this.media && this.media.type && this.media.type.startsWith('video/');
    },
    hasGeoLocationData() {
      return this.metadata && 
             this.metadata.exif && 
             ((this.metadata.exif.GPSLatitude && this.metadata.exif.GPSLongitude) || 
              (this.metadata.exif.latitude && this.metadata.exif.longitude));
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
    },
    hasAdvancedExif() {
      return this.isImage && this.metadata && this.metadata.exif;
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
    // Check if we're coming from an album view
    const referrer = document.referrer;
    if (referrer && referrer.includes('/album/')) {
      // Extract album ID from the referrer URL
      const albumIdMatch = referrer.match(/\/album\/([^/]+)/);
      if (albumIdMatch && albumIdMatch[1]) {
        this.albumId = albumIdMatch[1];
        console.log('Viewing from album:', this.albumId);
      }
    }
    
    // Also check if album ID is in the query params (for direct navigation or page refresh)
    const urlParams = new URLSearchParams(window.location.search);
    const albumParam = urlParams.get('album');
    if (albumParam) {
      this.albumId = albumParam;
      console.log('Album ID from query param:', this.albumId);
    }
    
    // Check if we're coming from a circle view
    const circleParam = urlParams.get('circle');
    if (circleParam) {
      this.circleId = circleParam;
      this.circleActiveTab = urlParams.get('tab') || 'files'; // Default to files tab
      console.log('Circle ID from query param:', this.circleId, 'Tab:', this.circleActiveTab);
    }
    
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
          this.$router.push('/gallery');
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

        // If we have a circle ID, get only items from that circle
        if (this.circleId) {
          await this.fetchCircleFiles();
        // If we have an album ID, get only items from that album
        } else if (this.albumId) {
          await this.fetchAlbumItems();
        } else {
          // Otherwise use the original behavior - fetch from global media list
          await this.fetchNeighborItems();
        }
      } catch (error) {
        console.error('Error fetching media details:', error);
        this.$router.push('/gallery');
      } finally {
        this.loading = false;
      }
    },

    async fetchCircleFiles() {
      try {
        console.log('Fetching files for circle:', this.circleId);
        const response = await api.get(`/circles/${this.circleId}/files`);
        const circleFiles = response.data.files || [];
        
        if (circleFiles.length > 0) {
          // Find the index of the current item in the circle's files
          const currentIndex = circleFiles.findIndex(item => item._id === this.id);
          
          if (currentIndex !== -1) {
            console.log(`Current item is at index ${currentIndex} of ${circleFiles.length} items in circle`);
            
            // Set previous item if available
            if (currentIndex > 0) {
              this.previousItem = circleFiles[currentIndex - 1];
              console.log('Previous item in circle:', this.previousItem.originalName);
            }
            
            // Set next item if available
            if (currentIndex < circleFiles.length - 1) {
              this.nextItem = circleFiles[currentIndex + 1];
              console.log('Next item in circle:', this.nextItem.originalName);
            }
          } else {
            console.warn('Current item not found in circle files array');
          }
        } else {
          console.warn('Circle has no files');
        }
      } catch (error) {
        console.error('Error fetching circle files:', error);
      }
    },

    async fetchAlbumItems() {
      try {
        console.log('Fetching items for album:', this.albumId);
        const response = await api.get(`/albums/${this.albumId}/files`);
        this.albumItems = response.data.files;
        
        if (this.albumItems.length > 0) {
          // Find the index of the current item in the album
          const currentIndex = this.albumItems.findIndex(item => item._id === this.id);
          
          if (currentIndex !== -1) {
            console.log(`Current item is at index ${currentIndex} of ${this.albumItems.length} items in album`);
            
            // Set previous item if available
            if (currentIndex > 0) {
              this.previousItem = this.albumItems[currentIndex - 1];
              console.log('Previous item in album:', this.previousItem.originalName);
            }
            
            // Set next item if available
            if (currentIndex < this.albumItems.length - 1) {
              this.nextItem = this.albumItems[currentIndex + 1];
              console.log('Next item in album:', this.nextItem.originalName);
            }
          } else {
            console.warn('Current item not found in album items array');
          }
        } else {
          console.warn('Album has no items');
        }
      } catch (error) {
        console.error('Error fetching album items:', error);
      }
    },

    async fetchNeighborItems() {
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
          allItems.push(this.media);
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
    },

    onMediaLoad() {
      this.loading = false;
    },
    closeViewer() {
      if (this.circleId) {
        // If we're viewing from a circle, go back to that circle with the active tab
        this.$router.push({ 
          path: `/circles/${this.circleId}`, 
          query: { tab: this.circleActiveTab }
        });
      } else if (this.albumId) {
        // If we're viewing from an album, go back to that album
        this.$router.push({ name: 'AlbumView', params: { id: this.albumId } });
      } else {
        // Otherwise go back to the gallery
        this.$router.push('/gallery');
      }
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
    formatExposureProgram(program) {
      const programs = {
        0: 'Not defined',
        1: 'Manual',
        2: 'Program AE',
        3: 'Aperture-priority AE',
        4: 'Shutter speed-priority AE',
        5: 'Creative (Slow speed)',
        6: 'Action (High speed)',
        7: 'Portrait',
        8: 'Landscape',
        9: 'Bulb'
      };
      return programs[program] || 'Unknown';
    },
    formatExposureMode(mode) {
      const modes = {
        0: 'Auto',
        1: 'Manual',
        2: 'Auto bracket',
        3: 'Sequence'
      };
      return modes[mode] || 'Unknown';
    },
    formatExposureBias(bias) {
      if (bias === undefined) return '';
      return `${bias} EV`;
    },
    formatMeteringMode(mode) {
      const modes = {
        0: 'Unknown',
        1: 'Average',
        2: 'Center-weighted average',
        3: 'Spot',
        4: 'Multi-spot',
        5: 'Multi-segment',
        6: 'Partial',
        7: 'Other'
      };
      return modes[mode] || 'Unknown';
    },
    formatFlashMode(mode) {
      const modes = {
        0: 'No flash',
        1: 'Fired',
        2: 'Hand held, no flash',
        3: 'Fired, compulsory flash',
        4: 'Fired, compulsory flash, return light not detected',
        5: 'Fired, return light detected',
        7: 'Fired, return light not detected',
        8: 'No flash function',
        9: 'Fired, red-eye reduction',
        13: 'Fired, red-eye reduction',
        16: 'Fired, first curtain',
        20: 'Fired, second curtain',
        24: 'Fired, second curtain',
        25: 'Fired, first curtain',
        29: 'Fired, first curtain',
        31: 'Fired, second curtain',
        32: 'Fired, second curtain',
        33: 'Fired, first curtain',
        35: 'Fired, second curtain',
        36: 'Fired, first curtain',
        37: 'Fired, second curtain',
        38: 'Fired, first curtain',
        39: 'Fired, second curtain',
        40: 'Fired, first curtain',
        41: 'Fired, second curtain',
        42: 'Fired, first curtain',
        43: 'Fired, second curtain',
        44: 'Fired, first curtain',
        45: 'Fired, second curtain',
        48: 'Fired, first curtain',
        49: 'Fired, second curtain',
        50: 'Fired, first curtain',
        51: 'Fired, second curtain',
        52: 'Fired, first curtain',
        53: 'Fired, second curtain',
        54: 'Fired, first curtain',
        55: 'Fired, second curtain',
        56: 'Fired, first curtain',
        57: 'Fired, second curtain',
        58: 'Fired, first curtain',
        59: 'Fired, second curtain',
        60: 'Fired, first curtain',
        61: 'Fired, second curtain',
        62: 'Fired, first curtain',
        63: 'Fired, second curtain',
        64: 'Fired, first curtain',
        65: 'Fired, second curtain',
        66: 'Fired, first curtain',
        67: 'Fired, second curtain',
        68: 'Fired, first curtain',
        69: 'Fired, second curtain',
        70: 'Fired, first curtain',
        71: 'Fired, second curtain',
        72: 'Fired, first curtain',
        73: 'Fired, second curtain',
        74: 'Fired, first curtain',
        75: 'Fired, second curtain',
        76: 'Fired, first curtain',
        77: 'Fired, second curtain',
        78: 'Fired, first curtain',
        79: 'Fired, second curtain',
        80: 'Fired, first curtain',
        81: 'Fired, second curtain',
        82: 'Fired, first curtain',
        83: 'Fired, second curtain',
        84: 'Fired, first curtain',
        85: 'Fired, second curtain',
        86: 'Fired, first curtain',
        87: 'Fired, second curtain',
        88: 'Fired, first curtain',
        89: 'Fired, second curtain',
        90: 'Fired, first curtain',
        91: 'Fired, second curtain',
        92: 'Fired, first curtain',
        93: 'Fired, second curtain',
        94: 'Fired, first curtain',
        95: 'Fired, second curtain',
        96: 'Fired, first curtain',
        97: 'Fired, second curtain',
        98: 'Fired, first curtain',
        99: 'Fired, second curtain',
        100: 'Fired, first curtain',
        101: 'Fired, second curtain',
        102: 'Fired, first curtain',
        103: 'Fired, second curtain',
        104: 'Fired, first curtain',
        105: 'Fired, second curtain',
        106: 'Fired, first curtain',
        107: 'Fired, second curtain',
        108: 'Fired, first curtain',
        109: 'Fired, second curtain',
        110: 'Fired, first curtain',
        111: 'Fired, second curtain',
        112: 'Fired, first curtain',
        113: 'Fired, second curtain',
        114: 'Fired, first curtain',
        115: 'Fired, second curtain',
        116: 'Fired, first curtain',
        117: 'Fired, second curtain',
        118: 'Fired, first curtain',
        119: 'Fired, second curtain',
        120: 'Fired, first curtain',
        121: 'Fired, second curtain',
        122: 'Fired, first curtain',
        123: 'Fired, second curtain',
        124: 'Fired, first curtain',
        125: 'Fired, second curtain',
        126: 'Fired, first curtain',
        127: 'Fired, second curtain',
        128: 'Fired, first curtain',
        129: 'Fired, second curtain',
        130: 'Fired, first curtain',
        131: 'Fired, second curtain',
        132: 'Fired, first curtain',
        133: 'Fired, second curtain',
        134: 'Fired, first curtain',
        135: 'Fired, second curtain',
        136: 'Fired, first curtain',
        137: 'Fired, second curtain',
        138: 'Fired, first curtain',
        139: 'Fired, second curtain',
        140: 'Fired, first curtain',
        141: 'Fired, second curtain',
        142: 'Fired, first curtain',
        143: 'Fired, second curtain',
        144: 'Fired, first curtain',
        145: 'Fired, second curtain',
        146: 'Fired, first curtain',
        147: 'Fired, second curtain',
        148: 'Fired, first curtain',
        149: 'Fired, second curtain',
        150: 'Fired, first curtain',
        151: 'Fired, second curtain',
        152: 'Fired, first curtain',
        153: 'Fired, second curtain',
        154: 'Fired, first curtain',
        155: 'Fired, second curtain',
        156: 'Fired, first curtain',
        157: 'Fired, second curtain',
        158: 'Fired, first curtain',
        159: 'Fired, second curtain',
        160: 'Fired, first curtain',
        161: 'Fired, second curtain',
        162: 'Fired, first curtain',
        163: 'Fired, second curtain',
        164: 'Fired, first curtain',
        165: 'Fired, second curtain',
        166: 'Fired, first curtain',
        167: 'Fired, second curtain',
        168: 'Fired, first curtain',
        169: 'Fired, second curtain',
        170: 'Fired, first curtain',
        171: 'Fired, second curtain',
        172: 'Fired, first curtain',
        173: 'Fired, second curtain',
        174: 'Fired, first curtain',
        175: 'Fired, second curtain',
        176: 'Fired, first curtain',
        177: 'Fired, second curtain',
        178: 'Fired, first curtain',
        179: 'Fired, second curtain',
        180: 'Fired, first curtain',
        181: 'Fired, second curtain',
        182: 'Fired, first curtain',
        183: 'Fired, second curtain',
        184: 'Fired, first curtain',
        185: 'Fired, second curtain',
        186: 'Fired, first curtain',
        187: 'Fired, second curtain',
        188: 'Fired, first curtain',
        189: 'Fired, second curtain',
        190: 'Fired, first curtain',
        191: 'Fired, second curtain',
        192: 'Fired, first curtain',
        193: 'Fired, second curtain',
        194: 'Fired, first curtain',
        195: 'Fired, second curtain',
        196: 'Fired, first curtain',
        197: 'Fired, second curtain',
        198: 'Fired, first curtain',
        199: 'Fired, second curtain',
        200: 'Fired, first curtain',
        201: 'Fired, second curtain',
        202: 'Fired, first curtain',
        203: 'Fired, second curtain',
        204: 'Fired, first curtain',
        205: 'Fired, second curtain',
        206: 'Fired, first curtain',
        207: 'Fired, second curtain',
        208: 'Fired, first curtain',
        209: 'Fired, second curtain',
        210: 'Fired, first curtain',
        211: 'Fired, second curtain',
        212: 'Fired, first curtain',
        213: 'Fired, second curtain',
        214: 'Fired, first curtain',
        215: 'Fired, second curtain',
        216: 'Fired, first curtain',
        217: 'Fired, second curtain',
        218: 'Fired, first curtain',
        219: 'Fired, second curtain',
        220: 'Fired, first curtain',
        221: 'Fired, second curtain',
        222: 'Fired, first curtain',
        223: 'Fired, second curtain',
        224: 'Fired, first curtain',
        225: 'Fired, second curtain',
        226: 'Fired, first curtain',
        227: 'Fired, second curtain',
        228: 'Fired, first curtain',
        229: 'Fired, second curtain',
        230: 'Fired, first curtain',
        231: 'Fired, second curtain',
        232: 'Fired, first curtain',
        233: 'Fired, second curtain',
        234: 'Fired, first curtain',
        235: 'Fired, second curtain',
        236: 'Fired, first curtain',
        237: 'Fired, second curtain',
        238: 'Fired, first curtain',
        239: 'Fired, second curtain',
        240: 'Fired, first curtain',
        241: 'Fired, second curtain',
        242: 'Fired, first curtain',
        243: 'Fired, second curtain',
        244: 'Fired, first curtain',
        245: 'Fired, second curtain',
        246: 'Fired, first curtain',
        247: 'Fired, second curtain',
        248: 'Fired, first curtain',
        249: 'Fired, second curtain',
        250: 'Fired, first curtain',
        251: 'Fired, second curtain',
        252: 'Fired, first curtain',
        253: 'Fired, second curtain',
        254: 'Fired, first curtain',
        255: 'Fired, second curtain'
      };
      return modes[mode] || 'Unknown';
    },
    formatWhiteBalance(balance) {
      const balances = {
        0: 'Auto',
        1: 'Manual',
        2: 'Sunny',
        3: 'Shady',
        4: 'Cloudy',
        5: 'Tungsten',
        6: 'Fluorescent',
        7: 'Flash',
        8: 'Fine weather',
        9: 'Cloudy weather',
        10: 'Shady weather',
        11: 'Manual (Daylight)',
        12: 'Manual (Fluorescent)',
        13: 'Manual (Tungsten)',
        14: 'Manual (Flash)',
        15: 'Manual (Underwater)'
      };
      return balances[balance] || 'Unknown';
    },
    formatColorSpace(space) {
      const spaces = {
        0: 'sRGB',
        1: 'Adobe RGB',
        2: 'Wide Gamut RGB',
        3: 'Adobe Wide Gamut RGB',
        4: 'ProPhoto RGB',
        5: 'Wide Gamut RGB',
        6: 'ProPhoto RGB',
        7: 'ProPhoto RGB',
        8: 'sRGB',
        9: 'Adobe RGB',
        10: 'Wide Gamut RGB',
        11: 'Adobe Wide Gamut RGB',
        12: 'ProPhoto RGB',
        13: 'Wide Gamut RGB',
        14: 'ProPhoto RGB',
        15: 'ProPhoto RGB'
      };
      return spaces[space] || 'Unknown';
    },
    formatSceneType(type) {
      const types = {
        0: 'Standard',
        1: 'Landscape',
        2: 'Portrait',
        3: 'Night scene'
      };
      return types[type] || 'Unknown';
    },
    toggleMetadata() {
      this.showMetadata = !this.showMetadata;
      this.storeMetadataSetting(this.showMetadata);
    },
    getStoredMetadataSetting() {
      try {
        const setting = localStorage.getItem('lumia_show_metadata');
        return setting === 'true';
      } catch (error) {
        console.error('Error accessing localStorage:', error);
        return false;
      }
    },
    storeMetadataSetting(value) {
      try {
        localStorage.setItem('lumia_show_metadata', value.toString());
      } catch (error) {
        console.error('Error storing metadata setting:', error);
      }
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
        // Build the URL with appropriate context parameters
        let url = `/view/${this.previousItem._id}`;
        let params = [];
        
        // Include album ID if we're in album context
        if (this.albumId) {
          params.push(`album=${this.albumId}`);
        }
        
        // Include circle ID and tab if we're in circle context
        if (this.circleId) {
          params.push(`circle=${this.circleId}`);
          params.push(`tab=${this.circleActiveTab || 'files'}`);
        }
        
        // Add query parameters if we have any
        if (params.length > 0) {
          url += `?${params.join('&')}`;
        }
        
        window.location.href = url;
      }
    },
    navigateToNext() {
      console.log('Navigating to next item:', this.nextItem?._id);
      if (this.nextItem) {
        // Build the URL with appropriate context parameters
        let url = `/view/${this.nextItem._id}`;
        let params = [];
        
        // Include album ID if we're in album context
        if (this.albumId) {
          params.push(`album=${this.albumId}`);
        }
        
        // Include circle ID and tab if we're in circle context
        if (this.circleId) {
          params.push(`circle=${this.circleId}`);
          params.push(`tab=${this.circleActiveTab || 'files'}`);
        }
        
        // Add query parameters if we have any
        if (params.length > 0) {
          url += `?${params.join('&')}`;
        }
        
        window.location.href = url;
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
          event.preventDefault();
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
    },
    toggleAdvancedExif() {
      this.showAdvancedExif = !this.showAdvancedExif;
    }
  }
};
</script>

<style scoped>
/* CSS moved to external file */
</style> 