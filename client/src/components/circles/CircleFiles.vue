<template>
  <div class="files-container">
    <h3 class="section-title">Shared Files</h3>
    
    <div v-if="loading" class="loading-indicator">
      <div class="loading-spinner"></div>
      <p>Loading shared files...</p>
    </div>
    
    <div v-else-if="files.length === 0" class="empty-state">
      <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-7-7z"/>
        <path d="M13 2v7h7"/>
      </svg>
      <p>No files have been shared with this circle yet</p>
    </div>
    
    <div v-else class="files-grid">
      <div 
        v-for="file in files" 
        :key="file._id"
        class="file-card"
        @click="viewFile(file._id)"
      >
        <div class="file-thumbnail">
          <img 
            :src="`${apiBaseUrl}/thumbnails/${file._id}.jpg`" 
            :alt="file.originalName" 
            class="file-thumbnail-image"
          />
        </div>
        
        <div class="file-info">
          <h4 class="file-name" :title="file.originalName">{{ file.originalName }}</h4>
          <p class="file-meta">{{ formattedFileSize(file.size) }} · {{ fileTypeFormatted(file.mimetype) }}</p>
          <p class="file-owner">Shared by: {{ getOwnerName(file.userId) }}</p>
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
.files-container {
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

.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.file-card {
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.file-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-color: #9c6ade;
}

.file-thumbnail {
  height: 150px;
  overflow: hidden;
  position: relative;
  background-color: var(--color-bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
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
  padding: 1.2rem;
}

.file-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-meta {
  font-size: 0.9rem;
  color: var(--primary-color);
  margin: 0 0 0.3rem 0;
}

.file-owner {
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