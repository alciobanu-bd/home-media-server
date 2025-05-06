<template>
  <div class="circle-files-component">
    <h3 class="component-section-title">Shared Files</h3>
    
    <div v-if="loading && files.length === 0" class="loading-state-container">
      <div class="loading-spinner-animation"></div>
      <p>Loading shared files...</p>
    </div>
    
    <div v-else-if="files.length === 0" class="empty-state-container">
      <svg class="empty-state-icon" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
        <polyline points="13 2 13 9 20 9"></polyline>
      </svg>
      <p class="empty-state-message">No files have been shared with this circle yet.</p>
      <p class="empty-state-submessage">Share some files to get started!</p>
    </div>
    
    <div v-else class="files-display-grid">
      <div 
        v-for="file in files" 
        :key="file._id"
        class="file-item-card"
        @click="viewFile(file._id)"
        role="button"
        tabindex="0"
        @keydown.enter="viewFile(file._id)"
        @keydown.space.prevent="viewFile(file._id)"
      >
        <div class="file-card-thumbnail-section">
          <img 
            v-if="isImageFile(file)"
            :src="`${apiBaseUrl}/thumbnails/${file._id}.jpg`" 
            :alt="file.originalName" 
            class="file-thumbnail-img"
          />
          <div v-else-if="isVideoFile(file)" class="file-thumbnail-placeholder-icon video-placeholder">
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
              <line x1="7" y1="2" x2="7" y2="22"></line>
              <line x1="17" y1="2" x2="17" y2="22"></line>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <line x1="2" y1="7" x2="7" y2="7"></line>
              <line x1="2" y1="17" x2="7" y2="17"></line>
              <line x1="17" y1="17" x2="22" y2="17"></line>
              <line x1="17" y1="7" x2="22" y2="7"></line>
            </svg>
             <div class="video-play-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M8 5v14l11-7z"></path>
              </svg>
            </div>
          </div>
          <div v-else class="file-thumbnail-placeholder-icon">
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
        </div>
        
        <div class="file-card-info-section">
          <h4 class="file-card-name" :title="file.originalName">{{ file.originalName }}</h4>
          <p class="file-card-meta">{{ formattedFileSize(file.size) }}</p>
          <p class="file-card-owner-info">Shared by: {{ getOwnerName(file.userId) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CircleFiles',
  props: {
    files: {
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
  
  emits: ['view-file'],
  
  methods: {
    viewFile(fileId) {
      this.$emit('view-file', fileId);
    },
    
    isImageFile(file) {
      return file && file.type && file.type.startsWith('image/');
    },
    
    isVideoFile(file) {
      return file && file.type && file.type.startsWith('video/');
    },
    
    getOwnerName(userId) {
      if (!userId) return 'Unknown';
      
      // First check the owner map which might contain detailed user info
      if (this.ownerMap[userId]) {
        return this.ownerMap[userId].name || 'Unknown';
      }
      
      return 'Unknown';
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
.circle-files-component {
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

.files-display-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); /* Adjust for file card size */
  gap: 1.5rem; /* Standardized grid gap (24px if 1rem=16px) */
}

.file-item-card {
  background-color: var(--color-card-background);
  border-radius: 10px;
  box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.05));
  overflow: hidden;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
}

.file-item-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg, 0 6px 12px rgba(0, 0, 0, 0.08));
  border-color: var(--lumia-primary, #9c6ade); /* Changed to lumia-primary */
}

.file-card-thumbnail-section {
  height: 140px; /* Or adjust to desired height */
  background-color: var(--color-bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-bottom: 1px solid var(--color-border-light);
}

.file-thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-thumbnail-placeholder-icon {
  color: var(--color-text-tertiary);
  opacity: 0.7;
}

.file-card-info-section {
  padding: 0.85rem 1rem; /* Consistent padding */
  display: flex;
  flex-direction: column;
  flex-grow: 1; /* Allows content to fill card if card height is fixed */
}

.file-card-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 0.3rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-card-meta {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin: 0 0 0.4rem 0;
}

/* .meta-dot {
  margin: 0 0.25rem;
  opacity: 0.5;
} */

.file-card-owner-info {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  margin-top: auto; /* Pushes owner info to the bottom */
}

/* Dark Mode Styles */
[data-theme="dark"] .file-item-card {
  background-color: var(--color-card-background-dark, var(--color-bg-secondary)); 
  border-color: var(--color-border-dark, rgba(156, 106, 222, 0.25));
}

[data-theme="dark"] .file-item-card:hover {
  border-color: var(--lumia-primary-dark, var(--lumia-primary));
}

[data-theme="dark"] .file-card-thumbnail-section {
  background-color: var(--color-bg-tertiary-dark, var(--color-bg-primary));
  border-bottom-color: var(--color-border-light-dark, rgba(156, 106, 222, 0.2));
}

[data-theme="dark"] .file-thumbnail-placeholder-icon {
  color: var(--color-text-tertiary-dark, var(--color-text-secondary));
}

[data-theme="dark"] .file-card-name {
  color: var(--color-text-primary-dark, var(--color-text-primary));
}

[data-theme="dark"] .file-card-meta {
  color: var(--color-text-secondary-dark, var(--color-text-secondary));
}

[data-theme="dark"] .file-card-owner-info {
  color: var(--color-text-tertiary-dark, var(--color-text-tertiary));
}

.video-placeholder {
  position: relative; /* For positioning the play icon */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%; 
  height: 100%;
}

.video-play-icon {
  position: absolute;
  color: rgba(255, 255, 255, 0.8);
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-play-icon svg {
  width: 20px; /* Adjust size as needed */
  height: 20px;
}

.file-thumbnail-placeholder-icon.video-placeholder svg {
  /* Ensure the main placeholder SVG for video doesn't clash with play icon */
  opacity: 0.5; /* Or adjust as needed */
}
</style> 