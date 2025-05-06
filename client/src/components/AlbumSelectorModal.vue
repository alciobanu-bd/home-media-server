<template>
  <BaseModal
    :show="show"
    title="Add to Album"
    :primary-disabled="selectedAlbums.length === 0 || saving"
    :loading="saving"
    @close="cancel"
    @primary-action="save"
  >
    <template #icon-path>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <circle cx="8.5" cy="8.5" r="1.5"></circle>
      <polyline points="21 15 16 10 5 21"></polyline>
    </template>
    
    <template #primary-text>
      <span v-if="albums.length > 0 || !showCreateAlbumForm">Add to Albums</span>
      <span v-else>Create Album</span>
    </template>
    
    <template #loading-text>
      <span v-if="albums.length > 0 || !showCreateAlbumForm">Saving...</span>
      <span v-else>Creating...</span>
    </template>
    
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
    
    <div v-if="selectedAlbums.length > 0" class="selection-info">
      Selected {{ selectedAlbums.length }} album{{ selectedAlbums.length !== 1 ? 's' : '' }}
    </div>
    <div v-if="albums.length === 0 && showCreateAlbumForm" class="selection-info">
      Creating a new album
    </div>
  </BaseModal>
</template>

<script>
import api from '../services/api';
import BaseModal from './ui/BaseModal.vue';

export default {
  name: 'AlbumSelectorModal',
  components: {
    BaseModal
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
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
  watch: {
    show(val) {
      if (val) {
        this.fetchAlbums();
        this.selectedAlbums = [];
        this.showCreateAlbumForm = false;
        this.newAlbumName = '';
      }
    }
  },
  created() {
    if (this.show) {
      this.fetchAlbums();
    }
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
      if (index > -1) {
        this.selectedAlbums.splice(index, 1);
      } else {
        this.selectedAlbums.push(albumId);
      }
    },
    cancel() {
      this.$emit('close');
    },
    async save() {
      if (this.selectedAlbums.length === 0) return;
      
      try {
        this.saving = true;
        
        // Call the API to add media to each selected album
        const promises = this.selectedAlbums.map(albumId => {
          return api.post(`/albums/${albumId}/media`, {
            mediaIds: this.mediaIds
          });
        });
        
        await Promise.all(promises);
        
        // Emit success event
        this.$emit('saved', {
          albumIds: this.selectedAlbums,
          mediaIds: this.mediaIds
        });
        
        this.$emit('close');
      } catch (error) {
        console.error('Error adding media to albums:', error);
        alert('Failed to add items to albums. Please try again.');
      } finally {
        this.saving = false;
      }
    }
  }
};
</script>

<style scoped>
.modal-description {
  margin-bottom: 20px;
  color: var(--color-text-secondary);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.loading-spinner {
  border: 3px solid var(--color-border);
  border-radius: 50%;
  border-top: 3px solid var(--color-primary);
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-albums {
  text-align: center;
  padding: 20px 0;
}

.create-album-btn {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 15px auto;
}

.create-album-btn:hover {
  background-color: rgba(var(--color-primary-rgb), 0.05);
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: translateY(-1px);
}

.btn-icon {
  margin-right: 8px;
}

.new-album-input-container {
  display: flex;
  margin-top: 15px;
  background-color: var(--color-bg-secondary);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid var(--color-border);
}

.form-control {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: 0.95rem;
  margin-right: 10px;
}

.form-control:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.1);
}

.new-album-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-icon-btn {
  color: var(--color-text-secondary);
}

.save-icon-btn {
  color: var(--color-primary);
  border-color: rgba(var(--color-primary-rgb), 0.3);
  background-color: rgba(var(--color-primary-rgb), 0.05);
}

.icon-btn:hover {
  transform: translateY(-1px);
}

.icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.albums-list {
  margin-top: 15px;
}

.albums-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.albums-header h3 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.album-items {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.album-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.2s ease;
}

.album-item:last-child {
  border-bottom: none;
}

.album-item:hover {
  background-color: rgba(var(--color-primary-rgb), 0.05);
}

.album-item.selected {
  background-color: rgba(var(--color-primary-rgb), 0.1);
  border-left: 3px solid var(--color-primary);
}

.album-icon {
  margin-right: 15px;
  color: var(--color-text-secondary);
}

.album-details {
  flex: 1;
}

.album-name {
  font-weight: 500;
  margin-bottom: 3px;
  color: var(--color-text-primary);
}

.album-count {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.selection-info {
  margin-top: 20px;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  background-color: rgba(var(--color-primary-rgb), 0.1);
  padding: 8px 12px;
  border-radius: 6px;
  display: inline-block;
}

/* Dark mode overrides */
[data-theme="dark"] .form-control {
  background-color: var(--color-bg-tertiary);
  border-color: rgba(156, 106, 222, 0.3);
}

[data-theme="dark"] .album-items {
  border-color: rgba(156, 106, 222, 0.2);
  background-color: var(--color-bg-secondary);
}

[data-theme="dark"] .album-item {
  border-color: rgba(156, 106, 222, 0.1);
}

[data-theme="dark"] .create-album-btn {
  border-color: rgba(156, 106, 222, 0.3);
}

[data-theme="dark"] .new-album-input-container {
  background-color: var(--color-bg-tertiary);
  border-color: rgba(156, 106, 222, 0.3);
}

[data-theme="dark"] .icon-btn {
  border-color: rgba(156, 106, 222, 0.3);
}
</style>
</style>