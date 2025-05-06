<template>
  <div class="timeline-container">
    <h3 class="section-title">Recent Activity</h3>
    
    <div v-if="loading" class="loading-indicator">
      <div class="loading-spinner"></div>
      <p>Loading timeline...</p>
    </div>
    
    <div v-else-if="timeline.length === 0" class="empty-state">
      <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v4M12 16h.01"/>
      </svg>
      <p>No recent activity in this circle yet</p>
    </div>
    
    <div v-else class="timeline">
      <div v-for="(activity, index) in timeline" :key="index" class="timeline-item">
        <div class="timeline-header">
          <div class="user-avatar">
            <img v-if="activity.owner.picture" :src="activity.owner.picture" :alt="activity.owner.name">
            <div v-else class="default-avatar">
              {{ getInitials(activity.owner.name) }}
            </div>
          </div>
          
          <div class="activity-info">
            <div class="activity-title">
              <span class="username">{{ activity.owner.name }}</span>
              <span v-if="activity.type === 'file'">
                shared {{ activity.items.length > 1 ? `${activity.items.length} files` : 'a file' }}
              </span>
              <span v-else-if="activity.type === 'album'">
                added new media to {{ activity.items.length > 1 ? 'albums' : 'an album' }}
              </span>
            </div>
            <div class="activity-time">
              {{ formatTimeAgo(activity.createdAt) }}
            </div>
          </div>
        </div>
        
        <!-- File activity content -->
        <div v-if="activity.type === 'file'" class="activity-content files-grid">
          <div 
            v-for="file in activity.items" 
            :key="file.id"
            class="file-card"
            @click="viewFile(file.id)"
          >
            <div class="file-thumbnail">
              <img 
                :src="`${apiBaseUrl}/thumbnails/${file.thumbnailId}.jpg`" 
                :alt="file.originalName" 
                class="file-thumbnail-image"
              />
            </div>
            
            <div class="file-info">
              <h4 class="file-name" :title="file.originalName">{{ file.originalName }}</h4>
              <p class="file-meta">{{ formattedFileSize(file.size) }} · {{ fileTypeFormatted(file.mimetype) }}</p>
            </div>
          </div>
        </div>
        
        <!-- Album activity content -->
        <div v-else-if="activity.type === 'album'" class="activity-content">
          <div 
            v-for="album in activity.items" 
            :key="album.id"
            class="album-activity"
          >
            <div class="album-header">
              <h4 class="album-name">{{ album.name }}</h4>
              <span class="album-count">{{ album.fileCount }} items</span>
              <button 
                class="view-album-btn"
                @click="viewAlbum(album.id)"
              >
                View Album
              </button>
            </div>
            
            <div class="album-previews" v-if="album.previewFiles && album.previewFiles.length > 0">
              <div 
                v-for="preview in album.previewFiles" 
                :key="preview.id"
                class="album-preview-thumbnail"
              >
                <img 
                  :src="`${apiBaseUrl}/thumbnails/${preview.id}.jpg`" 
                  :alt="preview.originalName"
                />
              </div>
            </div>
            <div v-else class="album-no-previews">
              <p>No items in this album yet</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Pagination controls -->
      <div v-if="timeline.length > 0 && nextPageTimestamp" class="pagination">
        <button 
          class="pagination-btn load-more"
          :disabled="loadingMore"
          @click="loadMore"
        >
          <span v-if="loadingMore">
            <div class="loading-spinner-small"></div>
            Loading...
          </span>
          <span v-else>Load More</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CircleTimeline',
  props: {
    circleId: {
      type: String,
      required: true
    },
    timeline: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    loadingMore: {
      type: Boolean,
      default: false
    },
    nextPageTimestamp: {
      type: [Number, null],
      default: null
    },
    apiBaseUrl: {
      type: String,
      required: true
    }
  },
  
  emits: ['load-more', 'view-album', 'view-file'],
  
  methods: {
    loadMore() {
      this.$emit('load-more');
    },
    
    viewAlbum(albumId) {
      this.$emit('view-album', albumId);
    },
    
    viewFile(fileId) {
      this.$emit('view-file', fileId);
    },
    
    getInitials(name) {
      if (!name) return '?';
      return name.split(' ')
        .map(part => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
    },
    
    formatTimeAgo(dateString) {
      try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) {
          return 'just now';
        }
        
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
          return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
        }
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
          return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
        }
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) {
          return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
        }
        
        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths < 12) {
          return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
        }
        
        const diffInYears = Math.floor(diffInMonths / 12);
        return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
      } catch (error) {
        return 'unknown time';
      }
    },
    
    formattedFileSize(bytes) {
      if (!bytes) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    fileTypeFormatted(mimetype) {
      if (!mimetype) return 'File';
      
      if (mimetype.startsWith('image/')) {
        return 'Image';
      } else if (mimetype.startsWith('video/')) {
        return 'Video';
      } else if (mimetype.startsWith('audio/')) {
        return 'Audio';
      } else if (mimetype.includes('pdf')) {
        return 'PDF';
      } else if (mimetype.includes('document') || mimetype.includes('word')) {
        return 'Document';
      } else if (mimetype.includes('spreadsheet') || mimetype.includes('excel')) {
        return 'Spreadsheet';
      } else {
        return 'File';
      }
    }
  }
};
</script>

<style scoped>
/* Timeline Styles */
.timeline-container {
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

.timeline {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.timeline-item {
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-tertiary);
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid var(--primary-color);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-avatar {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--lumia-gradient);
  color: white;
  font-weight: 600;
}

.activity-info {
  flex: 1;
}

.activity-title {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.username {
  font-weight: 700;
  color: var(--primary-color);
  margin-right: 0.25rem;
}

.activity-time {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.activity-content {
  padding: 1.5rem;
}

.album-activity {
  margin-bottom: 1.5rem;
}

.album-activity:last-child {
  margin-bottom: 0;
}

.album-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.album-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  margin-right: 1rem;
}

.album-count {
  font-size: 0.875rem;
  color: var(--primary-color);
  margin-right: auto;
}

.view-album-btn {
  background: linear-gradient(45deg, #9c6ade, #1dd1a1);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-album-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(156, 106, 222, 0.25);
}

.album-previews {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.album-preview-thumbnail {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.album-preview-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.album-preview-thumbnail:hover img {
  transform: scale(1.05);
}

.album-no-previews {
  background-color: var(--color-bg-tertiary);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  color: var(--color-text-secondary);
}

.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.file-card {
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.file-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-color);
}

.file-thumbnail {
  height: 130px;
  overflow: hidden;
}

.file-thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.file-card:hover .file-thumbnail-image {
  transform: scale(1.05);
}

.file-info {
  padding: 0.8rem;
}

.file-name {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 0.4rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-meta {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.pagination-btn {
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.8rem 1.5rem;
  cursor: pointer;
  font-weight: 500;
  color: var(--color-text-primary);
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-2px);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn.load-more {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.loading-spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s linear infinite;
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