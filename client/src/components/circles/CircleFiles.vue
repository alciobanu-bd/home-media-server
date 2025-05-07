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
    
    <div v-else class="files-grid">
      <CircleFileCard
        v-for="file in files" 
        :key="file._id"
        :file="file"
        :apiBaseUrl="apiBaseUrl"
        @view-file="viewFile"
      />
    </div>
  </div>
</template>

<script>
import CircleFileCard from './CircleFileCard.vue';

export default {
  name: 'CircleFiles',
  components: {
    CircleFileCard
  },
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
    }
  }
};
</script>

<style scoped>
.circle-files-component {
  /* Main container for this component */
  width: 100%;
  overflow: hidden;
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

/* Files grid styling */
.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .files-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}

@media (max-width: 480px) {
  .files-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
</style> 