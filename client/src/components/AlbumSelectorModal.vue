<template>
  <div class="upload-modal-overlay" @click.self="cancel">
    <div class="upload-modal">
      <div class="modal-header">
        <h2>Add to Album</h2>
        <button class="close-btn" @click="cancel">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div class="modal-body">
        <div v-if="loading" class="loading-indicator">
          <div class="loading-spinner"></div>
          <p>Loading albums...</p>
        </div>
        
        <div v-else-if="albums.length === 0" class="empty-albums">
          <p>You don't have any albums yet.</p>
          <button @click="showCreateAlbumForm = true" class="create-album-btn">
            <svg class="btn-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create New Album
          </button>
        </div>
        
        <div v-else class="albums-list">
          <div class="albums-header">
            <h3>Select albums to add the selected items to:</h3>
            <button @click="showCreateAlbumForm = !showCreateAlbumForm" class="create-album-btn">
              <svg class="btn-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              New Album
            </button>
          </div>
          
          <div v-if="showCreateAlbumForm" class="new-album-input-container">
            <input
              v-model="newAlbumName"
              type="text"
              placeholder="Enter album name"
              required
              class="form-control"
              autofocus
              @keyup.enter="createAlbum"
            />
            <div class="new-album-actions">
              <button 
                type="button" 
                class="icon-btn cancel-icon-btn" 
                @click="showCreateAlbumForm = false"
                :disabled="saving"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <button 
                type="button" 
                class="icon-btn save-icon-btn" 
                @click="createAlbum"
                :disabled="!newAlbumName.trim() || saving"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="album-items">
            <label v-for="album in albums" :key="album._id" class="album-item">
              <input 
                type="checkbox"
                :value="album._id"
                v-model="selectedAlbums"
                :disabled="saving"
              >
              <div class="album-details">
                <span class="album-name">{{ album.name }}</span>
                <span class="album-count">{{ album.fileCount || 0 }} items</span>
              </div>
            </label>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <div class="selection-info" v-if="selectedAlbums.length > 0">
          Selected {{ selectedAlbums.length }} album{{ selectedAlbums.length !== 1 ? 's' : '' }}
        </div>
        <div class="modal-actions">
          <button type="button" class="cancel-btn" @click="cancel" :disabled="saving">Cancel</button>
          <button 
            type="button" 
            class="submit-btn" 
            @click="save" 
            :disabled="selectedAlbums.length === 0 || saving"
          >
            <span v-if="saving">Saving...</span>
            <span v-else>Add to Albums</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api';
// Add modal-specific styles to ensure proper display
import '../styles/UploadModal.css'; // Reuse the existing modal styles

export default {
  name: 'AlbumSelectorModal',
  props: {
    mediaIds: {
      type: Array,
      required: true
    }
  },
  emits: ['close', 'saved'],
  data() {
    return {
      albums: [],
      loading: true,
      saving: false,
      selectedAlbums: [],
      showCreateAlbumForm: false,
      newAlbumName: ''
    };
  },
  created() {
    console.log('AlbumSelectorModal created with mediaIds:', this.mediaIds);
    this.fetchAlbums();
    // Listen for Escape key to close the modal
    document.addEventListener('keydown', this.handleKeydown);
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeydown);
  },
  methods: {
    async fetchAlbums() {
      try {
        this.loading = true;
        const response = await api.get('/albums');
        this.albums = response.data.albums;
      } catch (error) {
        console.error('Error fetching albums:', error);
      } finally {
        this.loading = false;
      }
    },
    handleKeydown(event) {
      if (event.key === 'Escape') {
        if (this.showCreateAlbumForm) {
          this.showCreateAlbumForm = false;
        } else {
          this.cancel();
        }
      }
    },
    async createAlbum() {
      if (!this.newAlbumName.trim()) return;
      
      try {
        this.saving = true;
        const response = await api.post('/albums', {
          name: this.newAlbumName.trim()
        });
        
        // Add the new album to the list
        this.albums.unshift(response.data);
        
        // Select the newly created album
        this.selectedAlbums.push(response.data._id);
        
        // Reset the form
        this.newAlbumName = '';
        this.showCreateAlbumForm = false;
      } catch (error) {
        console.error('Error creating album:', error);
        alert('Failed to create album. Please try again.');
      } finally {
        this.saving = false;
      }
    },
    cancel() {
      console.log('AlbumSelectorModal - cancel() called');
      this.$emit('close');
    },
    async save() {
      if (this.selectedAlbums.length === 0) return;
      
      try {
        this.saving = true;
        
        // Add the selected media to each selected album
        const promises = this.selectedAlbums.map(albumId => 
          api.post(`/albums/${albumId}/media`, {
            mediaIds: this.mediaIds
          })
        );
        
        await Promise.all(promises);
        
        // Emit event that save was successful
        this.$emit('saved', {
          albumIds: this.selectedAlbums,
          mediaIds: this.mediaIds
        });
      } catch (error) {
        console.error('Error adding media to albums:', error);
        alert('Failed to add media to albums. Please try again.');
      } finally {
        this.saving = false;
      }
    }
  }
};
</script>

<style scoped>
/* Extend the modal styles */
.albums-list {
  margin: 16px 0;
}

.albums-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.albums-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text);
}

.new-album-input-container {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 8px;
}

.new-album-input-container .form-control {
  flex: 1;
}

.new-album-actions {
  display: flex;
  gap: 6px;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  background: var(--color-card-background);
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background: var(--color-hover);
}

.icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cancel-icon-btn {
  color: var(--color-danger, #dc3545);
}

.save-icon-btn {
  color: var(--color-success, #28a745);
}

.create-album-btn {
  background: var(--lumia-gradient);
  color: white;
  border: none;
  border-radius: 8px;
  box-shadow: var(--lumia-shadow);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  padding: 8px 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.create-album-btn:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.2));
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.create-album-btn:hover:before {
  opacity: 1;
}

.create-album-btn .btn-icon {
  stroke: currentColor;
  width: 18px;
  height: 18px;
  position: relative;
  z-index: 2;
  transition: transform 0.3s ease;
}

.create-album-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(156, 106, 222, 0.35);
}

.create-album-btn:hover .btn-icon {
  transform: translateY(-2px);
}

.submit-btn {
  background: var(--lumia-gradient);
  color: white;
  border: none;
  border-radius: 8px;
  box-shadow: var(--lumia-shadow);
  padding: 8px 16px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.submit-btn:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.2));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.submit-btn:hover:before {
  opacity: 1;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(156, 106, 222, 0.35);
}

.submit-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.album-items {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-card-background);
}

.album-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.album-item:last-child {
  border-bottom: none;
}

.album-item:hover {
  background-color: var(--color-hover);
}

.album-item input[type="checkbox"] {
  margin-right: 12px;
  cursor: pointer;
  width: 18px;
  height: 18px;
}

.album-details {
  display: flex;
  flex-direction: column;
}

.album-name {
  font-weight: 500;
  color: var(--color-text);
}

.album-count {
  font-size: 12px;
  color: var(--color-secondary);
  margin-top: 2px;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  background-color: var(--color-card-background);
  color: var(--color-text);
  font-size: 14px;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.loading-spinner {
  display: inline-block;
  width: 30px;
  height: 30px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: var(--color-primary);
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-albums {
  text-align: center;
  padding: 24px;
}

.empty-albums p {
  margin-bottom: 16px;
  color: var(--color-secondary);
}

.empty-albums .create-album-btn {
  margin: 0 auto;
}

.selection-info {
  font-size: 14px;
  color: var(--color-primary);
  font-weight: 500;
}

/* Dark mode enhancements */
@media (prefers-color-scheme: dark) {
  .create-album-btn, .submit-btn {
    box-shadow: 0 4px 15px rgba(156, 106, 222, 0.4);
  }
  
  .create-album-btn:hover, .submit-btn:hover {
    box-shadow: 0 6px 20px rgba(156, 106, 222, 0.5);
  }
}
</style> 