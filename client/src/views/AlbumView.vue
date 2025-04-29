<template>
  <div class="album-view">
    <div v-if="loading && !album" class="loading">
      Loading album...
    </div>
    
    <div v-else-if="!album" class="album-not-found">
      <div class="empty-content">
        <img :src="baseUrl + 'img/not-found.svg'" alt="Album Not Found" class="empty-icon" />
        <h2>Album Not Found</h2>
        <p>The album you're looking for doesn't exist or has been deleted</p>
        <button @click="goToAlbums" class="back-button">
          <svg class="btn-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Albums
        </button>
      </div>
    </div>
    
    <div v-else class="album-container">
      <div class="album-header">
        <div class="album-header-left">
          <button @click="goToAlbums" class="back-button">
            <svg class="btn-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back
          </button>
          <h1 class="album-title">{{ album.name }}</h1>
          <span class="album-count">{{ albumFiles.length }} items</span>
        </div>
        <div class="album-actions">
          <button class="album-action-btn edit-btn" @click="showEditModal = true">
            <svg class="btn-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            Rename
          </button>
          <button class="album-action-btn delete-btn" @click="showDeleteConfirmation = true">
            <svg class="btn-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            Delete Album
          </button>
        </div>
      </div>

      <div v-if="!albumFiles.length" class="empty-album">
        <div class="empty-content">
          <img :src="baseUrl + 'img/empty-album.svg'" alt="Empty Album" class="empty-icon" />
          <h2>This Album is Empty</h2>
          <p>Add some media to this album or go back to the gallery</p>
          <div class="empty-actions">
            <button @click="goToGallery" class="select-btn">
              <svg class="btn-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              Go to Gallery
            </button>
          </div>
        </div>
      </div>
      
      <div v-else>
        <div class="media-grid">
          <media-item 
            v-for="item in albumFiles" 
            :key="item._id"
            :item="item" 
            :select-mode="selectMode"
            :selected="selectedItems.includes(item._id)"
            :selection-index="selectedItems.indexOf(item._id)"
            @click="handleItemClick(item)"
            @select="toggleSelect(item)"
            @delete="removeFromAlbum(item)"
          />
        </div>
      </div>
    </div>

    <!-- Edit Album Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal-content">
        <h2>Rename Album</h2>
        <form @submit.prevent="updateAlbum">
          <div class="form-group">
            <label for="album-name">Album Name</label>
            <input
              id="album-name"
              v-model="editAlbumName"
              type="text"
              placeholder="Enter album name"
              required
              class="form-control"
              autofocus
            />
          </div>
          <div class="modal-actions">
            <button type="button" class="cancel-btn" @click="showEditModal = false">Cancel</button>
            <button type="submit" class="submit-btn" :disabled="!editAlbumName.trim() || updating">
              <span v-if="updating">Updating...</span>
              <span v-else>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <confirmation-dialog
      v-if="showDeleteConfirmation"
      message="Are you sure you want to delete this album? This action cannot be undone."
      @confirm="deleteAlbum"
      @cancel="showDeleteConfirmation = false"
    />
  </div>
</template>

<script>
import api from '../services/api';
import MediaItem from '../components/MediaItem.vue';
import ConfirmationDialog from '../components/ConfirmationDialog.vue';

export default {
  name: 'AlbumView',
  components: {
    MediaItem,
    ConfirmationDialog
  },
  data() {
    return {
      album: null,
      albumFiles: [],
      loading: true,
      showEditModal: false,
      showDeleteConfirmation: false,
      editAlbumName: '',
      updating: false,
      selectMode: false,
      selectedItems: [],
      baseUrl: process.env.BASE_URL || '/'
    };
  },
  created() {
    this.fetchAlbum();
  },
  watch: {
    // Watch for route param changes to reload album when navigating between albums
    '$route.params.id': function() {
      this.fetchAlbum();
    }
  },
  methods: {
    async fetchAlbum() {
      try {
        this.loading = true;
        const albumId = this.$route.params.id;
        
        // Fetch album details first
        const albumResponse = await api.get(`/albums/${albumId}`);
        this.album = albumResponse.data;
        
        // Then fetch album files separately
        const filesResponse = await api.get(`/albums/${albumId}/files`);
        this.albumFiles = filesResponse.data.files;
        
        // Set document title
        document.title = `${this.album.name} | Lumia`;
        
        // Initialize editAlbumName
        this.editAlbumName = this.album.name;
      } catch (error) {
        console.error('Error fetching album:', error);
        this.album = null;
        document.title = 'Album Not Found | Lumia';
      } finally {
        this.loading = false;
      }
    },
    goToAlbums() {
      this.$router.push({ name: 'Albums' });
    },
    goToGallery() {
      this.$router.push({ name: 'Gallery' });
    },
    handleItemClick(item) {
      if (!this.selectMode) {
        this.$router.push({ 
          name: 'ViewMedia', 
          params: { id: item._id },
          query: { album: this.$route.params.id }
        });
      }
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
    },
    toggleSelectMode() {
      this.selectMode = !this.selectMode;
      if (!this.selectMode) {
        this.selectedItems = [];
      }
    },
    async updateAlbum() {
      if (!this.editAlbumName.trim()) return;
      
      try {
        this.updating = true;
        await api.put(`/albums/${this.album._id}`, {
          name: this.editAlbumName.trim()
        });
        
        // Update local album name
        this.album.name = this.editAlbumName.trim();
        
        // Update document title
        document.title = `${this.album.name} | Lumia`;
        
        // Close modal
        this.showEditModal = false;
      } catch (error) {
        console.error('Error updating album:', error);
        alert('Failed to update album. Please try again.');
      } finally {
        this.updating = false;
      }
    },
    async deleteAlbum() {
      try {
        await api.delete(`/albums/${this.album._id}`);
        this.$router.push({ name: 'Albums' });
      } catch (error) {
        console.error('Error deleting album:', error);
        alert('Failed to delete album. Please try again.');
      } finally {
        this.showDeleteConfirmation = false;
      }
    },
    async removeFromAlbum(item) {
      try {
        await api.delete(`/albums/${this.album._id}/media/${item._id}`);
        // Remove the item from the local albumFiles array
        const index = this.albumFiles.findIndex(file => file._id === item._id);
        if (index !== -1) {
          this.albumFiles.splice(index, 1);
        }
      } catch (error) {
        console.error('Error removing item from album:', error);
        alert('Failed to remove item from album. Please try again.');
      }
    }
  }
};
</script>

<style scoped>
.album-view {
  padding: 24px;
  background-color: var(--color-background);
  min-height: calc(100vh - var(--header-height));
  box-sizing: border-box;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  font-size: 18px;
  color: var(--color-text-secondary);
}

.album-not-found, .empty-album {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.empty-content {
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon {
  width: 120px;
  height: 120px;
  opacity: 0.8;
  margin-bottom: 24px;
}

.album-not-found h2, .empty-album h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--color-text-primary);
}

.album-not-found p, .empty-album p {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin-bottom: 24px;
}

.album-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.album-header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.album-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.album-count {
  font-size: 15px;
  color: var(--color-text-secondary);
  background-color: var(--color-bg-tertiary);
  padding: 4px 10px;
  border-radius: 20px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-button:hover {
  background-color: var(--color-hover-dark);
  color: var(--color-text-primary);
}

.album-actions {
  display: flex;
  gap: 12px;
}

.album-action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-btn {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  border: none;
}

.edit-btn:hover {
  background-color: var(--color-hover-dark);
  color: var(--color-text-primary);
}

.delete-btn {
  /* background-color: var(--color-error); */
  background-color: #ef4444; /* Exact red color used in GalleryControls */
  color: white;
  border: none;
}

.delete-btn:hover {
  /* background-color: var(--color-error-dark); */
  background-color: #dc2626; /* Exact darker red on hover used in GalleryControls */
}

.btn-icon {
  stroke: currentColor;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

/* Empty actions */
.empty-actions {
  display: flex;
  gap: 12px;
}

.select-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.select-btn:hover {
  background-color: var(--color-hover-dark);
  color: var(--color-text-primary);
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
}

.modal-content {
  background-color: var(--color-card-background);
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border: 1px solid var(--color-border);
}

.modal-content h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--color-text-primary);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.form-control {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  transition: border-color 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.2);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.cancel-btn {
  padding: 10px 16px;
  background-color: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background-color: var(--color-hover);
}

.submit-btn {
  padding: 10px 16px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-btn:hover {
  background-color: var(--color-primary-dark);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .album-view {
    padding: 16px;
  }
  
  .album-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .album-header-left {
    flex-wrap: wrap;
  }
  
  .album-title {
    font-size: 24px;
  }
  
  .album-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .back-button, .album-action-btn {
    padding: 6px 12px;
    font-size: 13px;
  }
  
  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }
}
</style> 