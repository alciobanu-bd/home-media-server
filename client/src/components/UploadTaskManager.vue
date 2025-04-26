<template>
  <div class="recent-upload-notifications" v-if="hasRecentUploads">
    <div class="notification-header">
      <div class="notification-title">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
        Recent Uploads
      </div>
      <button class="close-btn" @click="clearAllNotifications">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      </button>
    </div>
    
    <div class="notifications-container">
      <div v-for="upload in recentUploads" :key="upload.id" class="notification-item">
        <div class="notification-content">
          <div class="notification-icon" :class="{ success: upload.success }">
            <svg v-if="upload.success" viewBox="0 0 24 24" width="18" height="18">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            <svg v-else viewBox="0 0 24 24" width="18" height="18">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </div>
          <div class="notification-text">
            <div class="notification-message">
              {{ upload.success ? 'Upload completed' : 'Upload failed' }}
            </div>
            <div class="notification-details">
              {{ upload.filename }} - {{ formatTimestamp(upload.timestamp) }}
            </div>
          </div>
        </div>
        <button class="dismiss-btn" @click="removeNotification(upload.id)">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import '../styles/UploadTaskManager.css';

export default {
  name: 'UploadTaskManager',
  data() {
    return {
      recentUploads: [],
      maxNotifications: 5
    };
  },
  computed: {
    hasRecentUploads() {
      return this.recentUploads.length > 0;
    }
  },
  created() {
    // Listen for upload completion events
    window.addEventListener('upload-completed', this.handleUploadCompleted);
  },
  beforeUnmount() {
    window.removeEventListener('upload-completed', this.handleUploadCompleted);
  },
  methods: {
    handleUploadCompleted(event) {
      // Get information about the upload
      const uploadData = event?.detail || { count: 0, duplicates: 0 };
      const totalCount = (uploadData.count || 1);
      const duplicatesCount = (uploadData.duplicates || 0);
      const newFilesCount = totalCount - duplicatesCount;
      
      // Create message text based on upload results
      let message;
      if (duplicatesCount > 0) {
        if (newFilesCount > 0) {
          message = `Uploaded ${newFilesCount} new files (${duplicatesCount} duplicates skipped)`;
        } else {
          message = `All files already existed in your library`;
        }
      } else {
        message = `${totalCount} files uploaded successfully`;
      }
      
      // Create a notification for the completed upload
      const newNotification = {
        id: Date.now().toString(),
        timestamp: new Date(),
        success: true,
        filename: 'Media files', 
        message: message
      };
      
      // Add to the beginning of our array
      this.recentUploads.unshift(newNotification);
      
      // Limit the number of notifications
      if (this.recentUploads.length > this.maxNotifications) {
        this.recentUploads = this.recentUploads.slice(0, this.maxNotifications);
      }
      
      // Notify the gallery to refresh
      this.$emit('no-active-tasks');
    },
    
    formatTimestamp(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      
      // If today, show time only
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      // Otherwise show date and time
      return date.toLocaleString([], { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit'
      });
    },
    
    removeNotification(id) {
      this.recentUploads = this.recentUploads.filter(n => n.id !== id);
    },
    
    clearAllNotifications() {
      this.recentUploads = [];
    }
  }
};
</script>

<style scoped>
.recent-upload-notifications {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 320px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 1000;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.notification-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.notification-title svg {
  margin-right: 8px;
  fill: #4caf50;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
}

.close-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.notifications-container {
  max-height: 320px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.notification-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.notification-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #ffebee;
  margin-right: 12px;
}

.notification-icon.success {
  background-color: #e8f5e9;
}

.notification-icon svg {
  fill: #f44336;
}

.notification-icon.success svg {
  fill: #4caf50;
}

.notification-text {
  flex: 1;
}

.notification-message {
  font-weight: 500;
  font-size: 14px;
  color: #333;
  margin-bottom: 2px;
}

.notification-details {
  font-size: 12px;
  color: #757575;
}

.dismiss-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  opacity: 0.5;
}

.dismiss-btn:hover {
  opacity: 1;
}
</style> 