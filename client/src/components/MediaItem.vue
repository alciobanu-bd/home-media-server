<template>
  <div 
    class="media-item" 
    :class="{ 'select-mode': selectMode, 'selected': selected }"
    @click="onItemClick"
  >
    <div class="media-thumbnail">
      <img v-if="isImage" :src="thumbnailUrl" alt="Thumbnail" />
      <div v-else-if="isVideo" class="video-thumbnail" @click.stop="onItemClick">
        <div class="video-placeholder">
          <img class="video-placeholder-svg" :src="baseUrl + 'img/video-placeholder.svg'" alt="Video Placeholder" />
        </div>
        
        <div class="video-icon">
          <img :src="baseUrl + 'img/video-icon.svg'" alt="Video Icon" />
        </div>
      </div>
    </div>
    
    <!-- Selection checkbox - visible on hover -->
    <div class="select-checkbox-trigger" v-if="canModify" @click.stop="startSelection">
      <div class="checkbox-container" :title="'Select'">
        <img :src="baseUrl + 'img/checkbox-icon.svg'" alt="Select" />
      </div>
    </div>
    
    <div class="media-actions" v-if="!selectMode && canModify">
      <button class="action-btn delete-btn" type="button" @click.stop="$emit('delete', item)">
        <img :src="baseUrl + 'img/delete-icon.svg'" alt="Delete" />
      </button>
    </div>
    
    <div class="select-checkbox-wrapper" v-if="selectMode" @click.stop="onSelectClick">
      <div class="checkbox-container" :class="{ 'checked': selected }" :title="selected ? 'Deselect' : 'Select'">
        <template v-if="selected">
          <span v-if="selectionIndex > -1" class="selection-index">{{ selectionIndex + 1 }}</span>
          <img v-else :src="baseUrl + 'img/checkbox-icon.svg'" alt="Selected" />
        </template>
      </div>
    </div>
    
    <!-- Add file extension display -->
    <div class="media-extension" v-if="fileExtension">
      {{ fileExtension }}
    </div>

    <!-- Add resolution display if available -->
    <div class="media-resolution" v-if="item.metadata && item.metadata.dimensions">
      {{ item.metadata.dimensions.width }} x {{ item.metadata.dimensions.height }}
    </div>
  </div>
</template>

<script>
import '../styles/MediaItem.css';

export default {
  name: 'MediaItem',
  props: {
    item: {
      type: Object,
      required: true
    },
    selectMode: {
      type: Boolean,
      default: false
    },
    selected: {
      type: Boolean,
      default: false
    },
    selectionIndex: {
      type: Number,
      default: -1 // -1 indicates not selected
    },
    canModify: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      baseUrl: process.env.BASE_URL || '/'
    };
  },
  computed: {
    thumbnailUrl() {
      return `/api/thumbnails/${this.item._id}.jpg`;
    },
    isImage() {
      return this.item.type && this.item.type.startsWith('image/');
    },
    isVideo() {
      return this.item.type && this.item.type.startsWith('video/');
    },
    fileExtension() {
      if (!this.item || !this.item.originalName) {
        return '';
      }
      const parts = this.item.originalName.split('.');
      if (parts.length > 1) {
        return parts[parts.length - 1].toUpperCase();
      } 
      return ''; // No extension found
    }
  },
  methods: {
    onItemClick() {
      console.log('MediaItem clicked:', this.item._id, 'selectMode:', this.selectMode);
      
      if (this.selectMode) {
        this.onSelectClick();
      } else {
        // Navigate
        this.$emit('click', this.item);
      }
    },
    onSelectClick() {
      console.log('Select operation for:', this.item._id);
      this.$emit('select', this.item);
    },
    startSelection() {
      // Only trigger if not already in select mode
      if (!this.selectMode) {
        // Tell parent to enter selection mode
        this.$parent.toggleSelectMode();
        
        // After entering selection mode, select this item
        if (this.item && this.item._id) {
          this.$emit('select', this.item);
        }
      }
    }
  }
};
</script>

<style scoped>
/* CSS moved to external file */
</style> 