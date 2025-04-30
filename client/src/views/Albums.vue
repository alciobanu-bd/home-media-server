<template>
  <div class="albums">
    <div v-if="loading && !albums.length" class="loading">
      Loading...
    </div>
    
    <div v-else-if="!albums.length" class="empty-albums">
      <div class="empty-content">
        <img :src="baseUrl + 'img/albums-empty.svg'" alt="No Albums" class="empty-icon" />
        <h2>No Albums Yet</h2>
        <p>Create your first album to organize your media files</p>
        <button @click="showCreateAlbumModal = true" class="create-album-btn">
          <svg class="btn-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Create Album
        </button>
      </div>
    </div>
    
    <div v-else>
      <div class="albums-header">
        <h1>Albums</h1>
        <button @click="showCreateAlbumModal = true" class="create-album-btn">
          <svg class="btn-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Create Album
        </button>
      </div>
      
      <div class="albums-grid">
        <div 
          v-for="album in albums" 
          :key="album._id"
          class="album-card"
        >
          <!-- Album menu icon with dropdown -->
          <div class="album-menu">
            <div 
              class="album-menu-icon" 
              @click.stop="toggleAlbumMenu(album._id)"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </div>
            <div 
              v-if="activeAlbumMenu === album._id" 
              class="album-dropdown-menu" 
              @click.stop
            >
              <div class="album-dropdown-item" @click="showRenameModal(album)">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
                Rename
              </div>
              <div class="album-dropdown-item" @click="showThumbnailModal(album)">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                Set Thumbnail
              </div>
              <div class="album-dropdown-item delete" @click="confirmDeleteAlbum(album)">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                Delete
              </div>
            </div>
          </div>
          
          <div 
            class="album-content"
            @click="viewAlbum(album)"
          >
            <div class="album-thumbnail">
              <div v-if="album.thumbnailId" class="album-thumbnail-container">
                <img 
                  :src="`${apiBaseUrl}/thumbnails/${album.thumbnailId}.jpg`" 
                  alt="Album thumbnail"
                  class="album-thumbnail-image"
                />
              </div>
              <div v-else-if="!album.fileCount || album.fileCount === 0" class="album-placeholder">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </div>
              <div v-else-if="album.thumbnails && album.thumbnails.length > 0" class="album-thumbnails">
                <div 
                  v-for="(thumbnail, index) in album.thumbnails.slice(0, 4)" 
                  :key="index"
                  class="album-thumbnail-item"
                >
                  <img :src="`${apiBaseUrl}/thumbnails/${thumbnail}.jpg`" alt="Album thumbnail" />
                </div>
              </div>
            </div>
            <div class="album-info">
              <h3 class="album-name">{{ album.name }}</h3>
              <p class="album-count">{{ album.fileCount || 0 }} items</p>
              <p class="album-date">{{ formatDate(album.createdAt) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Album Modal -->
    <rename-modal 
      v-if="showCreateAlbumModal"
      title="Create New Album"
      label="Album Name"
      placeholder="Enter album name"
      :initial-value="newAlbumName"
      :is-processing="creating"
      processing-text="Creating..."
      submit-text="Create Album"
      input-id="album-name"
      @cancel="showCreateAlbumModal = false"
      @submit="createAlbum"
    />
    
    <!-- Rename Album Modal -->
    <rename-modal 
      v-if="showRenameAlbumModal"
      title="Rename Album"
      label="Album Name"
      placeholder="Enter album name"
      :initial-value="editAlbumName"
      :is-processing="updating"
      processing-text="Updating..."
      submit-text="Save"
      input-id="rename-album-name"
      @cancel="showRenameAlbumModal = false"
      @submit="renameAlbum"
    />
    
    <!-- Select Thumbnail Modal -->
    <div v-if="showSetThumbnailModal" class="modal-overlay" @click.self="showSetThumbnailModal = false">
      <div class="modal-content thumbnail-modal">
        <h2>Select Album Thumbnail</h2>
        
        <!-- Content section -->
        <div class="modal-body">
          <div v-if="thumbnailLoading" class="loading">
            Loading thumbnails...
          </div>
          <div v-else-if="!albumFiles.length" class="empty-thumbnails">
            <p>No images in this album to set as thumbnail.</p>
          </div>
          <div v-else class="thumbnail-grid">
            <div 
              v-for="file in albumFiles" 
              :key="file._id"
              class="thumbnail-option"
              :class="{ 'selected': currentThumbnailId === file._id }"
              @click="selectThumbnail(file._id)"
            >
              <img :src="`${apiBaseUrl}/thumbnails/${file._id}.jpg`" alt="Thumbnail option" />
            </div>
          </div>
        </div>
        
        <!-- Always visible buttons section -->
        <div class="modal-actions">
          <button type="button" class="cancel-btn" @click="showSetThumbnailModal = false">Cancel</button>
          <button 
            class="submit-btn" 
            @click="setAlbumThumbnail" 
            :disabled="!currentThumbnailId || updating"
          >
            <span v-if="updating">Updating...</span>
            <span v-else>Save</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirmation" class="modal-overlay" @click.self="showDeleteConfirmation = false">
      <div class="modal-content">
        <h2>Delete Album</h2>
        <p class="delete-message">Are you sure you want to delete this album? This action cannot be undone.</p>
        <div class="modal-actions">
          <button type="button" class="cancel-btn" @click="showDeleteConfirmation = false">Cancel</button>
          <button 
            class="delete-btn" 
            @click="deleteAlbum" 
            :disabled="deleting"
          >
            <span v-if="deleting">Deleting...</span>
            <span v-else>Delete</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api';
import { format } from 'date-fns';
import RenameModal from '../components/RenameModal.vue';

export default {
  name: 'Albums',
  components: {
    RenameModal
  },
  data() {
    return {
      albums: [],
      loading: true,
      showCreateAlbumModal: false,
      showRenameAlbumModal: false,
      showSetThumbnailModal: false,
      showDeleteConfirmation: false,
      newAlbumName: '',
      editAlbumName: '',
      creating: false,
      updating: false,
      deleting: false,
      activeAlbumMenu: null,
      selectedAlbum: null,
      albumFiles: [],
      thumbnailLoading: false,
      currentThumbnailId: null,
      baseUrl: process.env.BASE_URL || '/',
      apiBaseUrl: 'http://localhost:3000/api'
    };
  },
  created() {
    this.fetchAlbums();
    // Add global click handler to close menus
    document.addEventListener('click', this.closeMenus);
    // Add ESC key handler for modals
    document.addEventListener('keydown', this.handleKeydown);
    // Set document title
    document.title = 'Albums | Lumia';
  },
  beforeUnmount() {
    // Remove global click handler when component is destroyed
    document.removeEventListener('click', this.closeMenus);
    document.removeEventListener('keydown', this.handleKeydown);
  },
  methods: {
    handleKeydown(event) {
      if (event.key === 'Escape') {
        // Close any open menus first
        if (this.activeAlbumMenu !== null) {
          this.activeAlbumMenu = null;
          return;
        }
        
        // Then close modals based on their state
        if (this.showCreateAlbumModal) {
          this.showCreateAlbumModal = false;
        }
        if (this.showDeleteConfirmation) {
          this.showDeleteConfirmation = false;
        }
        if (this.showSetThumbnailModal) {
          this.showSetThumbnailModal = false;
        }
        if (this.showRenameAlbumModal) {
          this.showRenameAlbumModal = false;
        }
      }
    },
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
    formatDate(dateStr) {
      const date = new Date(dateStr);
      return format(date, 'MMMM d, yyyy');
    },
    viewAlbum(album) {
      this.$router.push({ name: 'AlbumView', params: { id: album._id } });
    },
    toggleAlbumMenu(albumId) {
      // Toggle the menu for the clicked album
      this.activeAlbumMenu = this.activeAlbumMenu === albumId ? null : albumId;
    },
    closeMenus() {
      // Close any open menus
      this.activeAlbumMenu = null;
    },
    async createAlbum(newName) {
      if (!newName) return;
      
      try {
        this.creating = true;
        const response = await api.post('/albums', {
          name: newName
        });
        
        // Add the new album to the list
        this.albums.unshift(response.data);
        
        // Reset form and close modal
        this.newAlbumName = '';
        this.showCreateAlbumModal = false;
      } catch (error) {
        console.error('Error creating album:', error);
        alert('Failed to create album. Please try again.');
      } finally {
        this.creating = false;
      }
    },
    // Rename album related functions
    showRenameModal(album) {
      this.selectedAlbum = album;
      this.editAlbumName = album.name;
      this.showRenameAlbumModal = true;
      this.activeAlbumMenu = null; // Close the menu
    },
    async renameAlbum(newName) {
      if (!newName || !this.selectedAlbum) return;

      try {
        this.updating = true;
        await api.put(`/albums/${this.selectedAlbum._id}`, {
          name: newName
        });
        
        // Update the album in the local array
        const index = this.albums.findIndex(a => a._id === this.selectedAlbum._id);
        if (index !== -1) {
          this.albums[index].name = newName;
        }
        
        // Close modal
        this.showRenameAlbumModal = false;
        this.selectedAlbum = null;
      } catch (error) {
        console.error('Error renaming album:', error);
        alert('Failed to rename album. Please try again.');
      } finally {
        this.updating = false;
      }
    },
    // Delete album related functions
    confirmDeleteAlbum(album) {
      this.selectedAlbum = album;
      this.showDeleteConfirmation = true;
      this.activeAlbumMenu = null; // Close the menu
    },
    async deleteAlbum() {
      if (!this.selectedAlbum) return;

      try {
        this.deleting = true;
        await api.delete(`/albums/${this.selectedAlbum._id}`);
        
        // Remove the album from the local array
        this.albums = this.albums.filter(a => a._id !== this.selectedAlbum._id);
        
        // Close modal
        this.showDeleteConfirmation = false;
        this.selectedAlbum = null;
      } catch (error) {
        console.error('Error deleting album:', error);
        alert('Failed to delete album. Please try again.');
      } finally {
        this.deleting = false;
      }
    },
    // Thumbnail selection related functions
    async showThumbnailModal(album) {
      this.selectedAlbum = album;
      this.currentThumbnailId = album.thumbnailId || null;
      this.showSetThumbnailModal = true;
      this.activeAlbumMenu = null; // Close the menu
      
      // Fetch album files for thumbnail selection
      await this.fetchAlbumFiles(album._id);
    },
    async fetchAlbumFiles(albumId) {
      try {
        this.thumbnailLoading = true;
        const response = await api.get(`/albums/${albumId}/files`);
        this.albumFiles = response.data.files;
      } catch (error) {
        console.error('Error fetching album files:', error);
        alert('Failed to load album files. Please try again.');
        this.albumFiles = [];
      } finally {
        this.thumbnailLoading = false;
      }
    },
    selectThumbnail(fileId) {
      this.currentThumbnailId = fileId;
    },
    async setAlbumThumbnail() {
      if (!this.selectedAlbum || !this.currentThumbnailId) return;

      try {
        this.updating = true;
        // Update album with the new thumbnail ID
        await api.put(`/albums/${this.selectedAlbum._id}/thumbnail`, {
          thumbnailId: this.currentThumbnailId
        });
        
        // Update the album in the local array
        const index = this.albums.findIndex(a => a._id === this.selectedAlbum._id);
        if (index !== -1) {
          this.albums[index].thumbnailId = this.currentThumbnailId;
        }
        
        // Close modal
        this.showSetThumbnailModal = false;
        this.selectedAlbum = null;
        this.currentThumbnailId = null;
      } catch (error) {
        console.error('Error setting album thumbnail:', error);
        alert('Failed to set album thumbnail. Please try again.');
      } finally {
        this.updating = false;
      }
    }
  }
};
</script>

<style scoped>
.albums {
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

.empty-albums {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0 16px;
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

.empty-albums h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--color-text-primary);
}

.empty-albums p {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin-bottom: 24px;
}

.albums-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 16px;
}

.albums-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.create-album-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 18px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(var(--color-primary-rgb), 0.3);
}

.create-album-btn:hover {
  opacity: 0.8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.4);
}

.create-album-btn:active {
  transform: translateY(0);
}

.btn-icon {
  stroke: currentColor;
}

.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 32px;
  padding: 24px;
}

.album-card {
  background-color: var(--color-card-background);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid var(--color-border);
  padding-bottom: 12px;
  position: relative;
}

.album-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-color: var(--color-primary);
}

/* Album menu styles */
.album-menu {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 5;
}

.album-menu-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;
  color: white;
}

.album-menu-icon:hover {
  opacity: 1;
}

.album-dropdown-menu {
  position: absolute;
  top: 40px;
  right: 0;
  width: 200px;
  background-color: var(--color-card-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 10;
}

.album-dropdown-item {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-text-primary);
  transition: background-color 0.2s;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-dropdown-item:hover {
  background-color: var(--color-hover);
}

.album-dropdown-item.delete {
  color: var(--color-error);
}

.album-dropdown-item.delete:hover {
  background-color: #ffebeb; /* Light red background */
  color: #ef4444; /* Bright red text to emphasize */
}

.album-content {
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.album-thumbnail {
  height: 180px;
  background-color: var(--color-bg-tertiary);
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  overflow: hidden;
}

.album-thumbnail-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.album-thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.album-card:hover .album-thumbnail-image {
  transform: scale(1.05);
}

.album-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--color-text-secondary);
  opacity: 0.5;
}

.album-thumbnails {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 2px;
}

.album-thumbnail-item {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.album-thumbnail-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.album-info {
  padding: 20px;
}

.album-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-count {
  font-size: 14px;
  color: var(--color-primary);
  margin-bottom: 4px;
}

.album-date {
  font-size: 13px;
  color: var(--color-text-secondary);
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

.modal-body {
  margin-bottom: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.empty-thumbnails {
  padding: 24px;
  text-align: center;
  color: var(--color-text-secondary);
}

.thumbnail-modal {
  display: flex;
  flex-direction: column;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.thumbnail-modal .modal-body {
  overflow-y: auto;
  flex: 1;
}

.thumbnail-modal .modal-actions {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.delete-message {
  margin-bottom: 20px;
  color: var(--color-text-secondary);
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
  opacity: 0.8;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.delete-btn {
  padding: 10px 16px;
  background-color: var(--color-error, #ef4444);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background-color: #dc2626; /* Darker red on hover */
}

.delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Thumbnail selection grid */
.thumbnail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.thumbnail-option {
  border-radius: 6px;
  overflow: hidden;
  height: 100px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.thumbnail-option img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-option:hover {
  transform: scale(1.05);
}

.thumbnail-option.selected {
  border-color: var(--color-primary);
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .albums {
    padding: 16px;
  }
  
  .albums-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 20px;
    padding: 16px;
  }
  
  .album-thumbnail {
    height: 140px;
  }
  
  .album-name {
    font-size: 16px;
  }
  
  .albums-header h1 {
    font-size: 24px;
  }
  
  .create-album-btn {
    padding: 8px 14px;
    font-size: 14px;
  }
  
  .album-menu-icon {
    width: 28px;
    height: 28px;
  }
  
  .thumbnail-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  }
  
  .thumbnail-option {
    height: 80px;
  }
}
</style> 