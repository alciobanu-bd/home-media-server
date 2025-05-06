<template>
  <div class="circle-albums-component">
    <h3 class="component-section-title">Shared Albums</h3>
    
    <div v-if="loading && albums.length === 0" class="loading-state-container">
      <div class="loading-spinner-animation"></div>
      <p>Loading shared albums...</p>
    </div>
    
    <div v-else-if="albums.length === 0" class="empty-state-container">
      <svg class="empty-state-icon" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>
      <p class="empty-state-message">No albums have been shared with this circle yet.</p>
      <p class="empty-state-submessage">When albums are shared, they will appear here.</p>
    </div>
    
    <div v-else class="albums-display-grid">
      <div 
        v-for="album in albums" 
        :key="album._id"
        class="album-item-card"
        @click="viewAlbum(album._id)"
        role="button"
        tabindex="0"
        @keydown.enter="viewAlbum(album._id)"
        @keydown.space.prevent="viewAlbum(album._id)"
      >
        <div class="album-card-thumbnail-section">
          <div v-if="!album.thumbnailId && (!album.previewFiles || album.previewFiles.length === 0)" class="album-thumbnail-placeholder">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </div>
          <div v-else-if="album.thumbnailId" class="album-thumbnail-image-wrapper">
            <img 
              :src="`${apiBaseUrl}/thumbnails/${album.thumbnailId}.jpg`" 
              alt="Album thumbnail" 
              class="album-thumbnail-img"
            />
          </div>
           <div v-else-if="album.previewFiles && album.previewFiles.length > 0" class="album-thumbnail-mosaic">
            <div 
              v-for="(preview, index) in album.previewFiles.slice(0, 4)" 
              :key="preview.id || index"
              class="album-mosaic-item"
            >
              <img :src="`${apiBaseUrl}/thumbnails/${preview.id}.jpg`" alt="Thumbnail preview" />
            </div>
          </div>
        </div>
        
        <div class="album-card-info-section">
          <h4 class="album-card-title">{{ album.name }}</h4>
          <p class="album-card-meta">{{ album.fileCount || 0 }} items</p>
          <p class="album-card-owner-info">Shared by: {{ getOwnerName(album.userId) }}</p>
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
.circle-albums-component {
  /* Main container for this component */
}

.component-section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border-light);
}

.loading-state-container, .empty-state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1rem;
  text-align: center;
  background-color: var(--color-bg-secondary);
  border-radius: 10px;
  min-height: 200px;
}

.loading-spinner-animation {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border-alpha, rgba(156, 106, 222, 0.2));
  border-radius: 50%;
  border-top-color: var(--lumia-primary, #9c6ade);
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.loading-state-container p, .empty-state-message {
  font-size: 1.05rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.empty-state-icon {
  margin-bottom: 1rem;
  color: var(--color-text-tertiary);
  opacity: 0.8;
}

.empty-state-submessage {
  font-size: 0.9rem;
  color: var(--color-text-tertiary);
  margin-top: 0.25rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.albums-display-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); /* Consistent with Albums.vue */
  gap: 24px; /* Consistent with Albums.vue */
}

.album-item-card {
  background-color: var(--color-card-background);
  border-radius: 12px;
  box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.05));
  overflow: hidden;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
}

.album-item-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg, 0 8px 16px rgba(0, 0, 0, 0.1));
  border-color: var(--lumia-primary, #9c6ade);
}

.album-card-thumbnail-section {
  height: 160px; /* Consistent height for thumbnails */
  background-color: var(--color-bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden; /* Crucial for mosaic */
  position: relative; /* For absolute positioning inside if needed */
}

.album-thumbnail-placeholder {
  color: var(--color-text-tertiary);
  opacity: 0.6;
}

.album-thumbnail-image-wrapper {
  width: 100%;
  height: 100%;
}

.album-thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.25s ease-in-out;
}

.album-item-card:hover .album-thumbnail-img {
  transform: scale(1.05);
}

.album-thumbnail-mosaic {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 2px; /* Small gap for mosaic effect */
}

.album-mosaic-item {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.album-mosaic-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.album-card-info-section {
  padding: 1rem; /* Consistent padding */
}

.album-card-title {
  font-size: 1.05rem; /* Slightly smaller if needed */
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 0.35rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-card-meta {
  font-size: 0.85rem;
  color: var(--lumia-primary, #9c6ade);
  margin: 0 0 0.25rem 0;
  font-weight: 500;
}

.album-card-owner-info {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin: 0;
}
</style> 