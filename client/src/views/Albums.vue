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
          @click="viewAlbum(album)"
        >
          <div class="album-thumbnail">
            <div v-if="!album.fileCount || album.fileCount === 0" class="album-placeholder">
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
                <img :src="`http://localhost:3000/api/thumbnails/${thumbnail}.jpg`" alt="Album thumbnail" />
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

    <!-- Create Album Modal -->
    <div v-if="showCreateAlbumModal" class="modal-overlay" @click.self="showCreateAlbumModal = false">
      <div class="modal-content">
        <h2>Create New Album</h2>
        <form @submit.prevent="createAlbum">
          <div class="form-group">
            <label for="album-name">Album Name</label>
            <input
              id="album-name"
              v-model="newAlbumName"
              type="text"
              placeholder="Enter album name"
              required
              class="form-control"
              autofocus
            />
          </div>
          <div class="modal-actions">
            <button type="button" class="cancel-btn" @click="showCreateAlbumModal = false">Cancel</button>
            <button type="submit" class="submit-btn" :disabled="!newAlbumName.trim() || creating">
              <span v-if="creating">Creating...</span>
              <span v-else>Create Album</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api';
import { format } from 'date-fns';

export default {
  name: 'Albums',
  data() {
    return {
      albums: [],
      loading: true,
      showCreateAlbumModal: false,
      newAlbumName: '',
      creating: false,
      baseUrl: process.env.BASE_URL || '/'
    };
  },
  created() {
    this.fetchAlbums();
    // Set document title
    document.title = 'Albums | Lumia';
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
    formatDate(dateStr) {
      const date = new Date(dateStr);
      return format(date, 'MMMM d, yyyy');
    },
    viewAlbum(album) {
      this.$router.push({ name: 'AlbumView', params: { id: album._id } });
    },
    async createAlbum() {
      if (!this.newAlbumName.trim()) return;
      
      try {
        this.creating = true;
        const response = await api.post('/albums', {
          name: this.newAlbumName.trim()
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
  background-color: var(--color-primary-dark);
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
}

.album-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-color: var(--color-primary);
}

.album-thumbnail {
  height: 180px;
  background-color: var(--color-bg-tertiary);
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
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
}
</style> 