<template>
  <div class="upload-modal-overlay" @click.self="closeModal">
    <div class="upload-modal">
      <div class="modal-header">
        <h2>Upload Media</h2>
        <button class="close-btn" @click="closeModal">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <circle cx="12" cy="12" r="10" fill="rgba(0, 0, 0, 0.05)"/>
            <path d="M15.59 7L12 10.59 8.41 7 7 8.41 10.59 12 7 15.59 8.41 17 12 13.41 15.59 17 17 15.59 13.41 12 17 8.41z" />
          </svg>
        </button>
      </div>
      
      <div class="modal-body">
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
            <p class="small">Supported formats: JPG, PNG, GIF, MP4, WebM</p>
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
      </div>
      
      <div class="modal-footer">
        <button class="cancel-btn" @click="closeModal">Cancel</button>
        <button 
          class="upload-btn" 
          :disabled="selectedFiles.length === 0 || uploading" 
          @click="startUpload"
        >
          {{ uploadButtonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import '../styles/UploadModal.css';
import api from '../services/api';

export default {
  name: 'UploadModal',
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
    
    async startUpload() {
      if (this.selectedFiles.length === 0 || this.uploading) return;
      
      this.uploading = true;
      this.uploadProgress = 0;
      this.totalFilesCount = this.selectedFiles.length;
      this.completedFilesCount = 0;
      
      const successfulUploads = [];
      const duplicateFiles = [];
      
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
      
      this.uploading = false;
      
      if (successfulUploads.length > 0) {
        // Show duplicate notifications if any found
        if (duplicateFiles.length > 0) {
          const duplicateMessage = duplicateFiles.length === 1
            ? `"${duplicateFiles[0].name}" is already in your library.`
            : `${duplicateFiles.length} files were already in your library.`;
          
          alert(duplicateMessage);
        }
        
        // Notify about upload completion
        window.dispatchEvent(new CustomEvent('upload-completed', { 
          detail: { 
            count: successfulUploads.length,
            duplicates: duplicateFiles.length
          }
        }));
        
        this.closeModal();
      } else {
        alert('All uploads failed. Please try again.');
      }
    },
    
    formatFileSize(bytes) {
      if (!bytes) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    handleEscKey(event) {
      if (event.key === 'Escape') {
        this.closeModal();
      }
    }
  }
};
</script> 