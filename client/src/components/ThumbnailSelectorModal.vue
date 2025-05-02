<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Select Album Thumbnail</h2>
        <button class="close-btn" @click="$emit('close')">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <circle cx="12" cy="12" r="10" fill="rgba(0, 0, 0, 0.05)"/>
            <path d="M15.59 7L12 10.59 8.41 7 7 8.41 10.59 12 7 15.59 8.41 17 12 13.41 15.59 17 17 15.59 13.41 12 17 8.41z" />
          </svg>
        </button>
      </div>
      
      <div class="modal-body">
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
      </div>
      
      <div class="modal-footer">
        <button class="secondary-btn" @click="$emit('close')">Cancel</button>
        <button 
          class="primary-btn" 
          @click="setThumbnail"
          :disabled="processing || !selectedFileId"
        >
          <span v-if="processing">Setting...</span>
          <span v-else>Set as Thumbnail</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api';
import albumsService from '../services/albumsService';

export default {
  name: 'ThumbnailSelectorModal',
  props: {
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
  created() {
    this.loadAlbumFiles();
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
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--color-bg-primary);
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
  background: linear-gradient(90deg, rgba(156, 106, 222, 0.05), rgba(29, 209, 161, 0.05));
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: var(--color-hover);
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--color-border);
  gap: 1rem;
  background: linear-gradient(90deg, rgba(156, 106, 222, 0.05), rgba(29, 209, 161, 0.05));
}

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
  border: 3px solid rgba(156, 106, 222, 0.1);
  border-radius: 50%;
  border-top: 3px solid #9c6ade;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem;
}

.error-message p {
  color: var(--color-error);
  margin-bottom: 1rem;
}

.retry-btn {
  background: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.empty-thumbnail-message {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-secondary);
}

.secondary-btn {
  background: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}

.secondary-btn:hover {
  background: rgba(156, 106, 222, 0.1);
  border-color: #9c6ade;
  color: #9c6ade;
}

.primary-btn {
  background: linear-gradient(45deg, #9c6ade, #1dd1a1);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 12px rgba(156, 106, 222, 0.25);
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(156, 106, 222, 0.35);
}

.primary-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
</style> 