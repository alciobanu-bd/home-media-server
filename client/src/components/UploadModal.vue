<template>
  <BaseModal
    :show="true"
    :title="albumId ? `Add Media to ${albumName}` : 'Upload Media'"
    :primary-disabled="selectedFiles.length === 0 || uploading"
    :loading="uploading"
    @close="closeModal"
    @primary-action="startUpload"
  >
    <template #icon-path>
      <path d="M21 14V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/>
      <path d="M16.5 9.4 7.55 4.24"/>
      <polyline points="3.29 7 12 12 20.71 7"/>
      <line x1="12" y1="22" x2="12" y2="12"/>
      <path d="M16 16v6"/>
      <path d="M19 19H13"/>
    </template>
    
    <template #primary-text>{{ uploadButtonText }}</template>
    <template #loading-text>{{ uploadButtonText }}</template>
    
    <div 
      class="upload-dropzone"
      :class="{ 'active': isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleFileDrop"
      @click="triggerFileInput"
    >
      <input 
        type="file" 
        ref="fileInput" 
        @change="handleFileSelect" 
        multiple 
        accept="image/*,video/*" 
        style="display: none"
      />
      <div class="dropzone-content">
        <svg viewBox="0 0 24 24" width="48" height="48">
          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
        </svg>
        <p>Drag photos and videos here, or click to select files</p>
        <p class="small">{{ albumId ? `Files will be automatically added to ${albumName}` : 'Supported formats: JPG, PNG, GIF, MP4, WebM' }}</p>
      </div>
    </div>
    
    <div class="selected-files" v-if="selectedFiles.length > 0">
      <h3>{{ selectedFiles.length }} File(s) Selected</h3>
      <div class="file-list">
        <div v-for="(file, index) in selectedFiles" :key="index" class="file-item">
          <div class="file-name">{{ file.name }}</div>
          <div class="file-size">{{ formatFileSize(file.size) }}</div>
          <button class="remove-file" @click="removeFile(index)">
            <svg viewBox="0 0 24 24" width="22" height="22">
              <circle cx="12" cy="12" r="10" fill="rgba(244, 67, 54, 0.1)"/>
              <path d="M15.59 7L12 10.59 8.41 7 7 8.41 10.59 12 7 15.59 8.41 17 12 13.41 15.59 17 17 15.59 13.41 12 17 8.41z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script>
import api from '../services/api';
import BaseModal from './ui/BaseModal.vue';

export default {
  name: 'UploadModal',
  components: {
    BaseModal
  },
  props: {
    albumId: {
      type: String,
      default: null
    },
    albumName: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      selectedFiles: [],
      isDragging: false,
      uploading: false,
      uploadProgress: 0,
      totalFilesCount: 0,
      completedFilesCount: 0
    };
  },
  computed: {
    uploadButtonText() {
      if (this.uploading) {
        return `Uploading ${this.completedFilesCount}/${this.totalFilesCount} (${this.uploadProgress}%)`;
      }
      return `Upload ${this.selectedFiles.length > 0 ? `(${this.selectedFiles.length})` : ''}`;
    }
  },
  created() {
    document.addEventListener('keydown', this.handleEscKey);
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleEscKey);
  },
  methods: {
    closeModal() {
      if (this.uploading) {
        if (!confirm('Upload in progress. Are you sure you want to close?')) {
          return;
        }
      }
      this.$emit('close');
    },
    
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    
    handleFileSelect(event) {
      this.addFiles(event.target.files);
    },
    
    handleFileDrop(event) {
      this.isDragging = false;
      this.addFiles(event.dataTransfer.files);
    },
    
    addFiles(fileList) {
      const newFiles = Array.from(fileList).filter(file => {
        return file.type.startsWith('image/') || file.type.startsWith('video/');
      });
      
      this.selectedFiles = [...this.selectedFiles, ...newFiles];
    },
    
    removeFile(index) {
      this.selectedFiles.splice(index, 1);
    },
    
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    handleEscKey(event) {
      if (event.key === 'Escape') {
        this.closeModal();
      }
    },
    
    async startUpload() {
      if (this.selectedFiles.length === 0 || this.uploading) return;
      
      this.uploading = true;
      this.uploadProgress = 0;
      this.totalFilesCount = this.selectedFiles.length;
      this.completedFilesCount = 0;
      
      const successfulUploads = [];
      const duplicateFiles = [];
      const fileIdsToAddToAlbum = [];
      
      for (let i = 0; i < this.selectedFiles.length; i++) {
        try {
          const file = this.selectedFiles[i];
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await api.post('/upload', formData, {
            onUploadProgress: (progressEvent) => {
              // Calculate overall progress as a combination of completed files and current file
              const currentFileProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              this.uploadProgress = Math.round(
                ((this.completedFilesCount * 100) + currentFileProgress) / this.totalFilesCount
              );
            }
          });
          
          this.completedFilesCount++;
          
          // Store file ID for possible album addition
          if (this.albumId) {
            fileIdsToAddToAlbum.push(response.data.id);
          }
          
          // Check if the file was a duplicate
          if (response.data.duplicate) {
            duplicateFiles.push({
              name: file.name,
              existingFile: response.data.originalName,
              id: response.data.id
            });
            console.log(`Duplicate detected: ${file.name}`);
          }
          
          successfulUploads.push(response.data);
          console.log(`Uploaded ${file.name} successfully`, response.data);
          
        } catch (error) {
          console.error('Upload failed:', error);
          // Continue with next file even if this one failed
        }
      }
      
      // If we're uploading to an album and have successful uploads, add them to the album
      if (this.albumId && fileIdsToAddToAlbum.length > 0) {
        try {
          await api.post(`/albums/${this.albumId}/files`, {
            fileIds: fileIdsToAddToAlbum
          });
          console.log(`Added ${fileIdsToAddToAlbum.length} files to album ${this.albumId}`);
        } catch (error) {
          console.error('Error adding files to album:', error);
        }
      }
      
      // Show toast notification
      const totalSuccess = successfulUploads.length;
      const totalDupes = duplicateFiles.length;
      const totalFailed = this.selectedFiles.length - totalSuccess;
      
      let message = `${totalSuccess} file${totalSuccess !== 1 ? 's' : ''} uploaded successfully.`;
      if (totalDupes > 0) {
        message += ` ${totalDupes} duplicate${totalDupes !== 1 ? 's' : ''} detected.`;
      }
      if (totalFailed > 0) {
        message += ` ${totalFailed} failed.`;
      }
      
      console.log('Upload complete:', message);
      
      // Reset the upload state and emit completion event
      this.uploading = false;
      this.selectedFiles = [];
      this.uploadProgress = 0;
      
      this.$emit('uploaded', {
        success: successfulUploads,
        duplicates: duplicateFiles,
        message
      });
    }
  }
};
</script>

<style scoped>
.upload-dropzone {
  border: 2px dashed var(--color-border);
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 20px;
  background-color: var(--color-bg-secondary);
}

.upload-dropzone.active {
  border-color: var(--color-primary);
  background-color: rgba(var(--color-primary-rgb), 0.05);
  transform: scale(0.99);
}

.dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dropzone-content svg {
  fill: var(--color-text-secondary);
  margin-bottom: 15px;
  opacity: 0.7;
  transition: all 0.3s ease;
}

.upload-dropzone:hover svg {
  transform: translateY(-5px);
  fill: var(--color-primary);
}

.dropzone-content p {
  margin: 5px 0;
  color: var(--color-text-primary);
  font-weight: 500;
}

.dropzone-content .small {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-top: 8px;
}

.selected-files {
  margin-top: 20px;
  padding: 0;
}

.selected-files h3 {
  margin: 0 0 15px;
  color: var(--color-text-primary);
  font-size: 1.1rem;
  display: flex;
  align-items: center;
}

.file-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background-color: var(--color-bg-secondary);
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid var(--color-border);
  transition: background-color 0.2s ease;
}

.file-item:hover {
  background-color: rgba(var(--color-primary-rgb), 0.05);
}

.file-item:last-child {
  border-bottom: none;
}

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-text-primary);
  font-weight: 500;
}

.file-size {
  margin: 0 15px;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  white-space: nowrap;
}

.remove-file {
  background: none;
  border: none;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  padding: 0;
}

.remove-file:hover {
  background-color: rgba(var(--color-error), 0.15);
  transform: scale(1.1);
}

/* Dark mode specific overrides */
[data-theme="dark"] .upload-dropzone {
  background-color: var(--color-bg-tertiary);
  border-color: rgba(156, 106, 222, 0.3);
}

[data-theme="dark"] .upload-dropzone.active {
  background-color: rgba(156, 106, 222, 0.2);
  border-color: var(--color-primary);
}

[data-theme="dark"] .dropzone-content svg {
  fill: var(--color-text-light);
}

[data-theme="dark"] .file-list {
  background-color: var(--color-bg-secondary);
  border-color: rgba(156, 106, 222, 0.2);
}

[data-theme="dark"] .file-item:hover {
  background-color: rgba(156, 106, 222, 0.1);
}
</style> 