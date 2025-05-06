<template>
  <BaseModal
    :show="show"
    title="Select Album Thumbnail"
    :primary-disabled="processing || !selectedFileId"
    :loading="processing"
    @close="$emit('close')"
    @primary-action="setThumbnail"
  >
    <template #icon-path>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <circle cx="8.5" cy="8.5" r="1.5"></circle>
      <polyline points="21 15 16 10 5 21"></polyline>
    </template>
    
    <template #primary-text>Set as Thumbnail</template>
    <template #loading-text>Setting...</template>
    
    <div v-if="loading" class="loading-indicator">
      <div class="loading-spinner"></div>
      <p>Loading album files...</p>
    </div>
    
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button class="retry-btn" @click="loadAlbumFiles">Try Again</button>
    </div>
    
    <div v-else-if="!files.length" class="empty-thumbnail-message">
      <p>This album is empty. Add media files to the album first to set a thumbnail.</p>
    </div>
    
    <div v-else class="thumbnail-grid">
      <div 
        v-for="file in files" 
        :key="file._id"
        class="thumbnail-option"
        :class="{ 'selected': selectedFileId === file._id }"
        @click="selectFile(file._id)"
      >
        <img :src="`${apiBaseUrl}/thumbnails/${file._id}.jpg`" :alt="file.originalName" />
      </div>
    </div>
  </BaseModal>
</template>

<script>
import api from '../services/api';
import albumsService from '../services/albumsService';
import BaseModal from './ui/BaseModal.vue';

export default {
  name: 'ThumbnailSelectorModal',
  components: {
    BaseModal
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    albumId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      files: [],
      loading: true,
      processing: false,
      error: null,
      selectedFileId: null,
      apiBaseUrl: 'http://localhost:3000/api'
    };
  },
  watch: {
    show(val) {
      if (val) {
        this.loadAlbumFiles();
        this.selectedFileId = null;
      }
    }
  },
  created() {
    if (this.show) {
      this.loadAlbumFiles();
    }
  },
  methods: {
    async loadAlbumFiles() {
      try {
        this.loading = true;
        this.error = null;
        
        const files = await albumsService.getAlbumFiles(this.albumId);
        
        // Filter to only include images (not videos)
        this.files = files.filter(file => file.type && file.type.startsWith('image/'));
      } catch (error) {
        console.error('Error loading album files:', error);
        this.error = 'Failed to load album files. Please try again.';
      } finally {
        this.loading = false;
      }
    },
    
    selectFile(fileId) {
      this.selectedFileId = fileId;
    },
    
    async setThumbnail() {
      if (!this.selectedFileId) return;
      
      try {
        this.processing = true;
        
        // Call API to set album thumbnail
        await api.put(`/albums/${this.albumId}/thumbnail`, {
          thumbnailId: this.selectedFileId
        });
        
        // Emit event to notify parent component that thumbnail was updated
        this.$emit('thumbnail-updated', {
          albumId: this.albumId,
          thumbnailId: this.selectedFileId
        });
        
        // Close the modal
        this.$emit('close');
      } catch (error) {
        console.error('Error setting album thumbnail:', error);
        alert('Failed to set album thumbnail. Please try again.');
      } finally {
        this.processing = false;
      }
    }
  }
};
</script>

<style scoped>
.thumbnail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.thumbnail-option {
  border-radius: 8px;
  overflow: hidden;
  height: 150px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.thumbnail-option img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-option:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.thumbnail-option.selected {
  border-color: var(--color-primary);
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(156, 106, 222, 0.4);
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loading-spinner {
  border: 3px solid var(--color-border);
  border-radius: 50%;
  border-top: 3px solid var(--color-primary);
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background-color: rgba(var(--color-error), 0.1);
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
}

.error-message p {
  margin-bottom: 1rem;
  color: var(--color-error);
}

.retry-btn {
  background-color: var(--color-error);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.empty-thumbnail-message {
  background-color: var(--color-bg-secondary);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  color: var(--color-text-secondary);
}

/* Dark mode overrides */
[data-theme="dark"] .thumbnail-option {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .thumbnail-option:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
}

[data-theme="dark"] .thumbnail-option.selected {
  box-shadow: 0 4px 14px rgba(156, 106, 222, 0.6);
}

[data-theme="dark"] .error-message {
  background-color: rgba(239, 68, 68, 0.15);
}

[data-theme="dark"] .empty-thumbnail-message {
  background-color: var(--color-bg-tertiary);
}
</style> 