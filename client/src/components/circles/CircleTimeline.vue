<template>
  <div class="timeline-container-component">
    <h3 class="component-section-title">Recent Activity</h3>
    
    <div v-if="loading && timeline.length === 0" class="loading-state-container">
      <div class="loading-spinner-animation"></div>
      <p>Loading timeline...</p>
    </div>
    
    <div v-else-if="timeline.length === 0" class="empty-state-container">
      <svg class="empty-state-icon" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
        <path d="M12 6v6l4 2"></path>
      </svg>
      <p class="empty-state-message">No recent activity in this circle yet.</p>
      <p class="empty-state-submessage">Shared files and album updates will appear here.</p>
    </div>
    
    <div v-else class="timeline-feed">
      <div v-for="(activity, index) in timeline" :key="index" class="timeline-item-card">
        <div class="timeline-item-header">
          <div class="user-avatar-container">
            <img v-if="activity.owner.picture" :src="activity.owner.picture" :alt="activity.owner.name" class="user-avatar-img">
            <div v-else class="user-avatar-default">
              {{ getInitials(activity.owner.name) }}
            </div>
          </div>
          
          <div class="activity-info-block">
            <div class="activity-summary">
              <span class="username-text">{{ activity.owner.name }}</span>
              <span v-if="activity.type === 'file'" class="action-text">
                shared {{ activity.items.length > 1 ? `${activity.items.length} files` : 'a file' }}
              </span>
              <span v-else-if="activity.type === 'album'" class="action-text">
                updated {{ activity.items.length > 1 ? 'albums' : 'an album' }}
              </span>
            </div>
            <div class="timestamp-text">
              {{ formatTimeAgo(activity.createdAt) }}
            </div>
          </div>
        </div>
        
        <div v-if="activity.type === 'file'" class="activity-content-block files-display-grid">
          <div 
            v-for="file in activity.items" 
            :key="file.id"
            class="content-file-card"
            @click="viewFile(file.id)"
            role="button"
            tabindex="0"
            @keydown.enter="viewFile(file.id)"
            @keydown.space.prevent="viewFile(file.id)"
          >
            <div class="file-card-thumbnail">
              <img 
                v-if="file.thumbnailId" 
                :src="`${apiBaseUrl}/thumbnails/${file.thumbnailId}.jpg`" 
                :alt="file.originalName" 
                class="file-thumbnail-actual-image"
              />
              <div v-else class="file-thumbnail-placeholder">
                 <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
              </div>
            </div>
            <div class="file-card-info">
              <h4 class="file-card-name" :title="file.originalName">{{ file.originalName }}</h4>
              <p class="file-card-meta">{{ formattedFileSize(file.size) }}</p>
            </div>
          </div>
        </div>
        
        <div v-else-if="activity.type === 'album'" class="activity-content-block album-display-section">
          <div 
            v-for="album in activity.items" 
            :key="album.id"
            class="content-album-card"
          >
            <div class="album-card-header">
              <h4 class="album-card-name">{{ album.name }}</h4>
              <span class="album-card-count">{{ album.fileCount }} items</span>
              <button 
                class="btn btn-secondary btn-sm view-album-action-btn"
                @click="viewAlbum(album.id)"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                View Album
              </button>
            </div>
            <div class="album-card-previews" v-if="album.previewFiles && album.previewFiles.length > 0">
              <div 
                v-for="preview in album.previewFiles.slice(0, 5)" 
                :key="preview.id"
                class="album-preview-img-wrapper"
              >
                <img 
                  :src="`${apiBaseUrl}/thumbnails/${preview.id}.jpg`" 
                  :alt="preview.originalName"
                  class="album-preview-img"
                />
              </div>
              <div v-if="album.previewFiles.length > 5" class="album-preview-more">
                +{{ album.previewFiles.length - 5 }}
              </div>
            </div>
            <div v-else class="album-previews-empty">
              <p>No previews available for this album.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="timeline.length > 0 && nextPageTimestamp" class="pagination-controls">
        <button 
          class="btn btn-secondary load-more-action-btn"
          :disabled="loadingMore"
          @click="loadMore"
        >
          <span v-if="loadingMore" class="loading-content-wrapper">
            <div class="btn-loading-spinner"></div>
            Loading...
          </span>
          <span v-else>Load More Activity</span>
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
  }
};
</script>

<style scoped>
.timeline-container-component {
  /* Container for the whole timeline section */
}

.component-section-title {
  font-size: 1.5rem; /* Consistent with other section titles */
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
  min-height: 200px; /* Give it some space */
  margin-bottom: 1.5rem;
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

.timeline-feed {
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* Space between timeline items */
}

.timeline-item-card {
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  border-radius: 10px;
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02));
  overflow: hidden; /* Ensure child elements conform to border-radius */
}

.timeline-item-header {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border-extra-light);
  background-color: var(--color-bg-primary); /* Can be slightly different if needed */
}

.user-avatar-container {
  width: 40px; /* Standard avatar size */
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  /* border: 2px solid var(--lumia-primary); Optional accent border */
}

.user-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar-default {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--lumia-gradient-soft, linear-gradient(45deg, rgba(156, 106, 222, 0.7), rgba(29, 209, 161, 0.7)));
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
}

.activity-info-block {
  flex: 1;
}

.activity-summary {
  font-size: 0.95rem;
  color: var(--color-text-primary);
  margin-bottom: 2px;
}

.username-text {
  font-weight: 600;
  color: var(--color-text-link, var(--lumia-primary, #9c6ade)); /* Make username stand out */
  margin-right: 0.25rem;
}

.action-text {
  /* Normal weight, follows username */
}

.timestamp-text {
  font-size: 0.8rem;
  color: var(--color-text-tertiary);
}

.activity-content-block {
  padding: 1.25rem;
  background-color: var(--color-background); /* Slightly different background for content */
}

/* File display within timeline */
.files-display-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); /* Adjust minmax for desired size */
  gap: 1rem;
}

.content-file-card {
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}

.content-file-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md, 0 4px 8px rgba(0,0,0,0.05));
  border-color: var(--lumia-primary-light, #a881e3);
}

.file-card-thumbnail {
  height: 100px; /* Adjust height as needed */
  background-color: var(--color-bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.file-thumbnail-actual-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.file-thumbnail-placeholder {
  color: var(--color-text-tertiary);
}

.file-card-info {
  padding: 0.75rem;
}

.file-card-name {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-primary);
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-card-meta {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin: 0;
}

/* Album display within timeline */
.album-display-section {
  /* General styling for album activities if needed */
}

.content-album-card {
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem; /* Space if multiple albums in one activity */
}
.content-album-card:last-child {
  margin-bottom: 0;
}

.album-card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.album-card-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  flex-grow: 1;
}

.album-card-count {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  background-color: var(--color-bg-tertiary);
  padding: 3px 8px;
  border-radius: 6px;
}

.btn {
  /* General button styles - copy from Circles.vue or global if available */
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-decoration: none;
  border: none;
}

.btn-secondary {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background-color: var(--color-hover);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  gap: 4px;
}

.btn-sm svg {
  width: 14px;
  height: 14px;
}


.album-card-previews {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.album-preview-img-wrapper {
  width: 60px; /* Smaller previews for timeline */
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--color-border-extra-light);
  background-color: var(--color-bg-tertiary);
}

.album-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.album-preview-more {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  background-color: var(--color-bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-extra-light);
}

.album-previews-empty {
  padding: 1rem;
  text-align: center;
  font-size: 0.85rem;
  color: var(--color-text-tertiary);
  background-color: var(--color-bg-tertiary);
  border-radius: 6px;
}

/* Pagination */
.pagination-controls {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border-light);
}

.load-more-action-btn {
 /* Uses .btn and .btn-secondary from above */
}

.loading-content-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor; /* Use button text color */
  border-radius: 50%;
  border-top-color: transparent;
  border-bottom-color: transparent; /* Or just one transparent side */
  animation: spin 0.8s linear infinite;
  opacity: 0.7;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style> 