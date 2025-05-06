<template>
  <div class="albums-container">
    <h3 class="section-title">Shared Albums</h3>
    
    <div v-if="loading" class="loading-indicator">
      <div class="loading-spinner"></div>
      <p>Loading albums...</p>
    </div>
    
    <div v-else-if="albums.length === 0" class="empty-state">
      <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1">
        <rect x="2" y="2" width="20" height="20" rx="2"/>
        <circle cx="8.5" cy="8.5" r="2"/>
        <path d="M20 15l-4.5-4.5-6.5 6.5"/>
      </svg>
      <p>No albums have been shared with this circle yet</p>
    </div>
    
    <div v-else class="albums-grid">
      <div 
        v-for="album in albums" 
        :key="album._id"
        class="album-card"
        @click="viewAlbum(album._id)"
      >
        <div class="album-thumbnail">
          <div v-if="!album.thumbnailId" class="album-placeholder">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="2.5"></circle>
              <path d="m21 15-5-5L5 21"></path>
            </svg>
          </div>
          <img 
            v-else 
            :src="`${apiBaseUrl}/thumbnails/${album.thumbnailId}.jpg`" 
            alt="Album thumbnail" 
            class="album-thumbnail-image"
          />
        </div>
        
        <div class="album-info">
          <h4 class="album-name">{{ album.name }}</h4>
          <p class="album-meta">{{ album.fileCount || 0 }} items</p>
          <p class="album-owner">Shared by: {{ getOwnerName(album.userId) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CircleAlbums',
  props: {
    albums: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    circleId: {
      type: String,
      required: true
    },
    ownerMap: {
      type: Object,
      default: () => ({})
    },
    apiBaseUrl: {
      type: String,
      required: true
    }
  },
  
  emits: ['view-album'],
  
  methods: {
    viewAlbum(albumId) {
      this.$emit('view-album', albumId);
    },
    
    getOwnerName(userId) {
      if (!userId) return 'Unknown';
      
      // First check the owner map which might contain detailed user info
      if (this.ownerMap[userId]) {
        return this.ownerMap[userId].name || 'Unknown';
      }
      
      return 'Unknown';
    }
  }
};
</script>

<style scoped>
.albums-container {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.6rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border);
  background: linear-gradient(90deg, #9c6ade, #1dd1a1);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.album-card {
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.album-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-color: #9c6ade;
}

.album-thumbnail {
  height: 150px;
  overflow: hidden;
  position: relative;
  background-color: var(--color-bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
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
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  color: var(--color-text-secondary);
  opacity: 0.5;
}

.album-info {
  padding: 1.2rem;
}

.album-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-meta {
  font-size: 0.9rem;
  color: var(--primary-color);
  margin: 0 0 0.3rem 0;
}

.album-owner {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  background-color: var(--color-bg-tertiary);
  border-radius: 10px;
  color: var(--color-text-secondary);
}

.empty-state svg {
  margin-bottom: 1rem;
  opacity: 0.6;
  color: var(--color-text-secondary);
}

.empty-state p {
  font-size: 1.1rem;
  max-width: 300px;
  margin: 0 auto;
}
</style> 