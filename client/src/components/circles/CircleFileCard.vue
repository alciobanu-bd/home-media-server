<template>
  <div 
    class="file-card"
    @click="$emit('view-file', file.id || file._id)"
    role="button"
    tabindex="0"
    @keydown.enter="$emit('view-file', file.id || file._id)"
    @keydown.space.prevent="$emit('view-file', file.id || file._id)"
  >
    <div class="file-thumbnail">
      <img 
        v-if="isImageFile || (file.thumbnailId || hasImageMimetype)"
        :src="`${apiBaseUrl}/thumbnails/${file.thumbnailId || file._id}.jpg`" 
        :alt="file.originalName" 
        class="thumbnail-img"
        loading="lazy"
      />
      <div v-else-if="isVideoFile" class="thumbnail-placeholder video-placeholder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
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
      <div v-else class="thumbnail-placeholder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      </div>
      
      <!-- File type indicator badge -->
      <div class="file-type-badge" v-if="fileType">
        {{ fileType }}
      </div>
      
      <!-- File size badge -->
      <div class="file-size-badge">
        {{ fileSizeFormatted }}
      </div>
      
      <!-- View indicator on hover -->
      <div class="view-indicator">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CircleFileCard',
  props: {
    file: {
      type: Object,
      required: true
    },
    apiBaseUrl: {
      type: String,
      required: true
    }
  },
  
  emits: ['view-file'],
  
  computed: {
    hasImageMimetype() {
      return this.file && this.file.mimetype && this.file.mimetype.startsWith('image/');
    },
    
    isImageFile() {
      return this.file && this.file.type && this.file.type.startsWith('image/');
    },
    
    isVideoFile() {
      return (this.file && this.file.type && this.file.type.startsWith('video/')) ||
             (this.file && this.file.mimetype && this.file.mimetype.startsWith('video/'));
    },
    
    fileType() {
      return this.getFileType(this.file.originalName);
    },
    
    fileSizeFormatted() {
      return this.formattedFileSize(this.file.size);
    }
  },
  
  methods: {
    getFileType(filename) {
      if (!filename) return '';
      
      const extension = filename.split('.').pop().toLowerCase();
      
      // Common file types
      const typeMap = {
        // Images
        jpg: 'JPG', jpeg: 'JPG', png: 'PNG', gif: 'GIF', svg: 'SVG', webp: 'WEBP',
        // Documents
        pdf: 'PDF', doc: 'DOC', docx: 'DOCX', xls: 'XLS', xlsx: 'XLSX', ppt: 'PPT', pptx: 'PPTX',
        // Audio
        mp3: 'MP3', wav: 'WAV', aac: 'AAC', flac: 'FLAC',
        // Video
        mp4: 'MP4', avi: 'AVI', mov: 'MOV', mkv: 'MKV', webm: 'WEBM',
        // Others
        zip: 'ZIP', rar: 'RAR', txt: 'TXT'
      };
      
      return typeMap[extension] || extension.toUpperCase();
    },
    
    formattedFileSize(bytes) {
      if (!bytes) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
  }
};
</script>

<style scoped>
.file-card {
  position: relative;
  aspect-ratio: 1/1;
  border-radius: 12px;
  overflow: hidden;
  background-color: var(--color-bg-tertiary);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transform: translateZ(0);
  transition: box-shadow 0.3s ease, transform 0.2s ease;
  will-change: transform, box-shadow;
  isolation: isolate;
}

.file-card:hover {
  box-shadow: var(--shadow-md);
  transform: scale(1.02);
}

.file-card:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--lumia-primary, #9c6ade);
}

.file-thumbnail {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: var(--color-bg-tertiary);
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: filter 0.2s ease;
}

.file-card:hover .thumbnail-img {
  filter: brightness(1.1);
}

.thumbnail-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--color-text-tertiary);
  background: linear-gradient(135deg, var(--color-bg-secondary), var(--color-bg-tertiary));
}

.thumbnail-placeholder svg {
  width: 36px;
  height: 36px;
  opacity: 0.8;
}

.video-placeholder {
  position: relative;
}

.video-play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

/* File badges */
.file-type-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  letter-spacing: 0.5px;
}

.file-size-badge {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.view-indicator {
  position: absolute;
  right: 10px;
  bottom: 10px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  color: var(--lumia-primary, #9c6ade);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.8);
  transition: opacity 0.2s ease, transform 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.view-indicator svg {
  width: 18px;
  height: 18px;
}

.file-card:hover .view-indicator {
  opacity: 1;
  transform: scale(1);
}

/* Responsive adjustments */
@media (max-width: 768px) {  
  .file-type-badge, 
  .file-size-badge {
    font-size: 0.65rem;
    padding: 3px 6px;
  }
  
  .view-indicator {
    width: 28px;
    height: 28px;
  }
  
  .view-indicator svg {
    width: 16px;
    height: 16px;
  }
}

@media (max-width: 480px) {
  .file-card {
    aspect-ratio: 1/1.1; /* Slightly taller to accommodate badges */
  }
  
  .file-type-badge, 
  .file-size-badge {
    font-size: 0.6rem;
    padding: 2px 5px;
  }
}
</style> 