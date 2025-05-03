<template>
  <div class="modal-overlay" @click.self="cancel">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Add to Album</h2>
        <button @click="cancel" class="close-button">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div class="modal-body">
        <p class="modal-description">
          Add {{ mediaIds.length }} selected item(s) to your albums
        </p>
        
        <div v-if="loading" class="loading-container">
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
            <div 
              v-for="album in albums" 
              :key="album._id" 
              class="album-item"
              :class="{ 'selected': selectedAlbums.includes(album._id) }"
              @click="toggleAlbum(album._id)"
            >
              <div class="album-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </div>
              <div class="album-details">
                <div class="album-name">{{ album.name }}</div>
                <div class="album-count">{{ album.fileCount || 0 }} item{{ album.fileCount !== 1 ? 's' : '' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-actions">
        <div class="selection-info" v-if="selectedAlbums.length > 0">
          Selected {{ selectedAlbums.length }} album{{ selectedAlbums.length !== 1 ? 's' : '' }}
        </div>
        <div v-if="albums.length === 0 && showCreateAlbumForm" class="selection-info">
          Creating a new album
        </div>
        <div class="buttons-container">
          <button type="button" class="cancel-button" @click="cancel" :disabled="saving">Cancel</button>
          <button 
            v-if="albums.length > 0 || !showCreateAlbumForm"
            type="button" 
            class="save-button" 
            @click="save" 
            :disabled="selectedAlbums.length === 0 || saving"
          >
            <span v-if="saving">Saving...</span>
            <span v-else>Add to Albums</span>
          </button>
          <button 
            v-if="albums.length === 0 && showCreateAlbumForm" 
            type="button" 
            class="save-button" 
            @click="createAlbum" 
            :disabled="!newAlbumName.trim() || saving"
          >
            <span v-if="saving">Creating...</span>
            <span v-else>Create Album</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api';

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
    toggleAlbum(albumId) {
      const index = this.selectedAlbums.indexOf(albumId);
      
      if (index === -1) {
        this.selectedAlbums.push(albumId);
      } else {
        this.selectedAlbums.splice(index, 1);
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
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  background-color: var(--color-background);
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.modal-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-background-light, var(--color-background));
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: var(--color-text-primary);
}

.close-button {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: var(--color-background-hover);
  color: var(--color-text-primary);
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex-grow: 1;
}

.modal-description {
  margin-top: 0;
  margin-bottom: 20px;
  color: var(--color-text-secondary);
}

.albums-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
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
  color: var(--color-text-primary);
}

.album-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
}

.album-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  position: relative;
}

.album-item:hover {
  background-color: var(--color-background-hover);
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  border-color: var(--color-border);
}

.album-item.selected {
  background-color: var(--lumia-purple-light);
  border-color: var(--lumia-purple);
}

.album-icon {
  color: var(--lumia-purple);
  margin-right: 12px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--lumia-purple-light, rgba(145, 95, 255, 0.1));
  transition: all 0.2s ease;
}

.album-item:hover .album-icon {
  transform: scale(1.05);
  background-color: var(--lumia-purple-light, rgba(145, 95, 255, 0.2));
}

.album-item.selected .album-icon {
  background-color: var(--lumia-purple);
  color: white;
}

.album-details {
  flex-grow: 1;
}

.album-name {
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.album-count {
  font-size: 0.9em;
  color: var(--color-text-secondary);
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

.form-control {
  width: 100%;
  padding: 10px 12px;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  background-color: var(--color-card-background);
  color: var(--color-text);
  font-size: 14px;
}

.loading-container {
  padding: 30px;
  text-align: center;
  color: var(--color-text-secondary);
}

.loading-spinner {
  border: 3px solid var(--color-border);
  border-top: 3px solid var(--lumia-purple);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-albums {
  padding: 30px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.empty-albums .create-album-btn {
  margin-top: 10px;
}

.empty-albums .new-album-input-container {
  width: 100%;
  max-width: 350px;
  margin-top: 15px;
}

.create-album-btn {
  background-color: var(--lumia-purple);
  color: white;
  border: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  padding: 8px 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  box-shadow: 0 2px 5px rgba(145, 95, 255, 0.3);
}

.create-album-btn:hover {
  background-color: var(--lumia-purple-dark, #7549d4);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(145, 95, 255, 0.4);
  color: white;
}

.create-album-btn .btn-icon {
  stroke: currentColor;
  width: 18px;
  height: 18px;
}

.modal-actions {
  padding: 16px 20px;
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selection-info {
  font-size: 14px;
  color: var(--lumia-purple);
  font-weight: 500;
}

.buttons-container {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-button {
  background-color: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.cancel-button:hover {
  background-color: var(--color-background-hover);
  transform: translateY(-1px);
}

.save-button {
  background-color: var(--lumia-purple);
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  box-shadow: 0 2px 5px rgba(145, 95, 255, 0.3);
}

.save-button:hover:not(:disabled) {
  background-color: var(--lumia-purple-dark, #7549d4);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(145, 95, 255, 0.4);
  color: white;
}

.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

/* Dark mode enhancements */
@media (prefers-color-scheme: dark) {
  .create-album-btn, .save-button {
    box-shadow: 0 4px 15px rgba(156, 106, 222, 0.4);
  }
  
  .create-album-btn:hover, .save-button:hover:not(:disabled) {
    box-shadow: 0 6px 20px rgba(156, 106, 222, 0.5);
  }
}
</style> 