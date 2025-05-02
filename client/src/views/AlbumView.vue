<template>
  <div class="album-view">
    <div v-if="loading" class="loading">
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
          <button class="album-action-btn view-btn" @click="groupByDate = !groupByDate">
            <svg class="btn-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            {{ groupByDate ? 'Grid View' : 'Group by Day' }}
          </button>
          <button v-if="isAlbumOwner" class="album-action-btn upload-btn" @click="showUploadModal = true">
            <svg class="btn-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Upload
          </button>
          <button v-if="isAlbumOwner" class="album-action-btn edit-btn" @click="showEditModal = true">
            <svg class="btn-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            Rename
          </button>
          <button v-if="isAlbumOwner" class="album-action-btn share-btn" @click="showShareModal = true">
            <svg class="btn-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            Share to Circle
          </button>
          <button v-if="isAlbumOwner" class="album-action-btn delete-btn" @click="showDeleteConfirmation = true">
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
        <div class="selection-controls" v-if="albumFiles.length > 0 && isAlbumOwner">
          <button class="control-btn" @click="toggleSelectMode">
            {{ inSelectionMode ? 'Cancel Selection' : 'Select Items' }}
          </button>
          <button 
            v-if="inSelectionMode && selectedItems.length > 0" 
            class="control-btn remove-btn" 
            @click="removeSelectedItems"
          >
            Remove from album ({{ selectedItems.length }})
          </button>
        </div>
        
        <!-- Grouped by date view -->
        <div v-if="groupByDate" class="media-grid-grouped">
          <div v-for="(group, date) in groupedAlbumFiles" :key="date" class="date-group">
            <h2 class="date-header">
              {{ formatDate(date) }}
              <button
                v-if="date !== 'ungrouped' && isAlbumOwner"
                class="day-select-btn"
                @click.prevent="handleDaySelect(date)"
                title="Select all items from this day"
              >
                Select Day
              </button>
              <div style="flex-grow: 1;"></div>
            </h2>
            <div class="media-grid">
              <media-item 
                v-for="item in group" 
                :key="item._id"
                :item="item" 
                :select-mode="isAlbumOwner && inSelectionMode"
                :selected="selectedItems.includes(item._id)"
                :selection-index="selectedItems.indexOf(item._id)"
                :can-modify="isAlbumOwner"
                @click="handleItemClick(item)"
                @select="isAlbumOwner ? toggleSelect(item) : null"
                @delete="isAlbumOwner ? removeFromAlbum(item) : null"
              />
            </div>
          </div>
        </div>
        
        <!-- Regular grid view -->
        <div v-else class="media-grid-grouped">
          <div class="date-group">
            <div class="media-grid">
          <media-item 
            v-for="item in albumFiles" 
            :key="item._id"
            :item="item" 
            :select-mode="isAlbumOwner && inSelectionMode"
            :selected="selectedItems.includes(item._id)"
            :selection-index="selectedItems.indexOf(item._id)"
            :can-modify="isAlbumOwner"
            @click="handleItemClick(item)"
            @select="isAlbumOwner ? toggleSelect(item) : null"
            @delete="isAlbumOwner ? removeFromAlbum(item) : null"
          />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Album Modal -->
    <rename-modal 
      v-if="showEditModal"
      title="Rename Album"
      label="Album Name"
      placeholder="Enter album name"
      :initial-value="editAlbumName"
      :is-processing="updating"
      processing-text="Updating..."
      submit-text="Save"
      input-id="album-name"
      @cancel="showEditModal = false"
      @submit="updateAlbum"
    />

    <!-- Delete Confirmation Modal -->
    <confirmation-dialog
      v-if="showDeleteConfirmation"
      message="Are you sure you want to delete this album? This action cannot be undone."
      @confirm="deleteAlbum"
      @cancel="showDeleteConfirmation = false"
    />

    <!-- Upload Modal -->
    <upload-modal
      v-if="showUploadModal"
      :album-id="$route.params.id"
      :album-name="album?.name"
      @close="showUploadModal = false"
      @upload-complete="refreshAlbumFiles"
    />
    
    <!-- Share to Circle Modal -->
    <circle-selector-modal
      v-if="showShareModal"
      :album-id="$route.params.id"
      :album-name="album?.name"
      :shared-circle-ids="album?.circleIds || []"
      @close="showShareModal = false"
      @shared="handleAlbumShared"
    />
  </div>
</template>

<script>
import albumsService from '../services/albumsService';
import MediaItem from '../components/MediaItem.vue';
import ConfirmationDialog from '../components/ConfirmationDialog.vue';
import UploadModal from '../components/UploadModal.vue';
import RenameModal from '../components/RenameModal.vue';
import CircleSelectorModal from '../components/CircleSelectorModal.vue';
import authStore from '../store/authStore';

export default {
  name: 'AlbumView',
  components: {
    MediaItem,
    ConfirmationDialog,
    UploadModal,
    RenameModal,
    CircleSelectorModal
  },
  data() {
    // Load view preference from localStorage
    const loadViewPreference = () => {
      try {
        const savedPreference = localStorage.getItem('albumViewGroupByDate');
        return savedPreference !== null ? JSON.parse(savedPreference) : false;
      } catch (e) {
        console.error('Error loading view preference:', e);
        return false;
      }
    };
    
    return {
      album: null,
      albumFiles: [],
      loading: true,
      showEditModal: false,
      showDeleteConfirmation: false,
      showUploadModal: false,
      showShareModal: false,
      editAlbumName: '',
      updating: false,
      inSelectionMode: false,
      selectedItems: [],
      baseUrl: process.env.BASE_URL || '/',
      groupByDate: loadViewPreference()
    };
  },
  created() {
    this.fetchAlbum();
    // Add ESC key handler for modals
    document.addEventListener('keydown', this.handleKeydown);
  },
  beforeUnmount() {
    // Remove event listener when component is destroyed
    document.removeEventListener('keydown', this.handleKeydown);
  },
  watch: {
    // Watch for route param changes to reload album when navigating between albums
    '$route.params.id': function() {
      this.fetchAlbum();
    },
    // Watch for changes to groupByDate to save preference
    groupByDate: function(newValue) {
      this.saveViewPreference(newValue);
    }
  },
  methods: {
    // Handle ESC key to close modals
    handleKeydown(event) {
      if (event.key === 'Escape') {
        // Close modals based on their state
        if (this.showEditModal) {
          this.showEditModal = false;
        }
        if (this.showDeleteConfirmation) {
          this.showDeleteConfirmation = false;
        }
        if (this.showUploadModal) {
          this.showUploadModal = false;
        }
        if (this.showShareModal) {
          this.showShareModal = false;
        }
      }
    },
    // Method to save view preference to localStorage
    saveViewPreference(value) {
      try {
        localStorage.setItem('albumViewGroupByDate', JSON.stringify(value));
      } catch (e) {
        console.error('Error saving view preference:', e);
      }
    },
    async fetchAlbum() {
      try {
        this.loading = true;
        const albumId = this.$route.params.id;
        
        // Fetch album details first
        this.album = await albumsService.getAlbumById(albumId);
        
        // Then fetch album files separately
        this.albumFiles = await albumsService.getAlbumFiles(albumId);
        
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
      if (!this.inSelectionMode) {
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
      this.inSelectionMode = !this.inSelectionMode;
      if (!this.inSelectionMode) {
        this.selectedItems = [];
      }
    },
    async updateAlbum(newName) {
      if (!newName) return;
      
      try {
        this.updating = true;
        await albumsService.updateAlbum(this.album._id, newName);
        
        // Update local album name
        this.album.name = newName;
        this.editAlbumName = newName;
        
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
        await albumsService.deleteAlbum(this.album._id);
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
        await albumsService.removeMediaFromAlbum(this.album._id, item._id);
        // Remove the item from the local albumFiles array
        const index = this.albumFiles.findIndex(file => file._id === item._id);
        if (index !== -1) {
          this.albumFiles.splice(index, 1);
        }
      } catch (error) {
        console.error('Error removing item from album:', error);
        alert('Failed to remove item from album. Please try again.');
      }
    },
    async removeSelectedItems() {
      if (this.selectedItems.length === 0) return;
      
      try {
        const confirmMessage = this.selectedItems.length === 1 
          ? 'Are you sure you want to remove this item from the album?' 
          : `Are you sure you want to remove these ${this.selectedItems.length} items from the album?`;
        
        if (!confirm(confirmMessage)) return;
        
        // Create array of promises for all delete operations
        const deletePromises = this.selectedItems.map(itemId => 
          albumsService.removeMediaFromAlbum(this.album._id, itemId)
        );
        
        // Execute all delete operations
        await Promise.all(deletePromises);
        
        // Remove items from local albumFiles array
        this.albumFiles = this.albumFiles.filter(file => !this.selectedItems.includes(file._id));
        
        // Clear selection and exit select mode
        this.selectedItems = [];
        this.inSelectionMode = false;
        
      } catch (error) {
        console.error('Error removing items from album:', error);
        alert('Failed to remove some items from album. Please try again.');
      }
    },
    handleAlbumShared(data) {
      // Update the local album object with the new circleIds
      if (!this.album.circleIds) {
        this.album.circleIds = [];
      }
      this.album.circleIds = data.circleIds;
      
      // Show a success message
      alert('Album has been shared successfully!');
    },
    refreshAlbumFiles() {
      this.fetchAlbum();
    },
    formatDate(dateStr) {
      if (dateStr === 'ungrouped') return '';
      
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      if (dateStr === today) {
        return 'Today';
      } else if (dateStr === yesterday) {
        return 'Yesterday';
      } else {
        return new Date(dateStr).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    },
    handleDaySelect(date) {
      // Enable selection mode if not already enabled
      if (!this.inSelectionMode) {
        this.inSelectionMode = true;
      }
      
      // Get all items from the selected day
      const dayItems = this.groupedAlbumFiles[date] || [];
      
      // Add all items from the day to selection without duplicates
      dayItems.forEach(item => {
        if (!this.selectedItems.includes(item._id)) {
          this.selectedItems.push(item._id);
        }
      });
    }
  },
  computed: {
    // Check if the current user is the album owner
    isAlbumOwner() {
      return this.album && authStore.state.user && this.album.userId === authStore.state.user.id;
    },
    // Computed property to group media by date when groupByDate is true
    groupedAlbumFiles() {
      if (!this.groupByDate) {
        // Return simple array when grouping is disabled
        return { ungrouped: this.albumFiles };
      }
      
      // Group by date when enabled
      const groups = {};
      this.albumFiles.forEach(item => {
        const date = new Date(item.createdAt).toISOString().split('T')[0];
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(item);
      });
      
      // Sort dates in descending order
      return Object.keys(groups)
        .sort((a, b) => new Date(b) - new Date(a))
        .reduce((obj, key) => {
          obj[key] = groups[key];
          return obj;
        }, {});
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
  margin-bottom: 0;
  position: sticky;
  top: var(--header-height);
  z-index: 10;
  background-color: var(--color-background);
  padding: 16px 0;
  border-bottom: 1px solid var(--color-border);
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
  background: linear-gradient(90deg, #10b981, #34d399, #6ee7b7, #a7f3d0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-family: 'Poppins', sans-serif;
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

.view-btn {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  border: none;
}

.view-btn:hover {
  background-color: var(--color-hover-dark);
  color: var(--color-text-primary);
}

.upload-btn {
  background-color: var(--color-bg-tertiary);
  color: white;
  border: none;
}

.upload-btn:hover {
  background-color: var(--color-hover-dark);
  color: white;
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

.share-btn {
  background-color: rgba(156, 106, 222, 0.2);
  color: #9c6ade;
  border: none;
}

.share-btn:hover {
  background-color: rgba(156, 106, 222, 0.3);
  color: #7c4dae;
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
  margin-bottom: 0px;
}

.media-grid-grouped {
  display: flex;
  flex-direction: column;
  gap: 30px;
  margin-bottom: 70px;
}

.date-group {
  margin-bottom: 0;
}

.date-header {
  font-size: 18px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  background: linear-gradient(90deg, #10b981, #34d399, #6ee7b7, #a7f3d0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
}

.day-select-btn {
  padding: 4px 8px;
  font-size: 12px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-left: 10px;
  -webkit-text-fill-color: initial;
  background: none;
}

.day-select-btn:hover {
  background-color: var(--color-hover-dark);
  color: var(--color-text-primary);
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
  opacity: 0.8;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Selection controls */
.selection-controls {
  display: flex;
  gap: 12px;
  margin-bottom: 0;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 20;
  background-color: var(--color-card-background);
  padding: 16px 24px;
  border-top: 1px solid var(--color-border);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  justify-content: center;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  border: none;
}

.control-btn:hover {
  background-color: var(--color-hover-dark);
  color: var(--color-text-primary);
}

.remove-btn {
  background-color: #ef4444;
  color: white;
}

.remove-btn:hover {
  background-color: #dc2626;
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