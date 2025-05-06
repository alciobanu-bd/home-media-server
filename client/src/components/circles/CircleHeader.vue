<template>
  <div class="circle-header">
    <div class="title-section">
      <h1>
        {{ name }}
        <button v-if="isAdmin" class="edit-circle-btn" @click="$emit('edit')" title="Edit Circle Name & Description">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
          </svg>
          <span class="edit-label">Edit Circle</span>
        </button>
      </h1>
      <div class="description-container">
        <div class="description-text">
          <p v-if="description" class="description">
            {{ description }}
          </p>
          <p v-else class="no-description">
            No description provided
          </p>
        </div>
      </div>
    </div>
    
    <!-- Circle content actions -->
    <div class="circle-actions">
      <button class="action-button upload-button" @click="$emit('upload')">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        Upload
      </button>
      <button class="action-button share-button" @click="$emit('share-album')">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
        Share Album
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CircleHeader',
  props: {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    isAdmin: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['edit', 'upload', 'share-album']
};
</script>

<style scoped>
.circle-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.title-section {
  flex: 1;
  padding-right: 100px;
}

.title-section h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  background: linear-gradient(90deg, #9c6ade, #1dd1a1);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
}

.description-container {
  display: flex;
  width: 100%;
  margin-top: 0.5rem;
}

.description-text {
  width: 100%;
}

.description, .no-description {
  position: relative;
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 1rem;
  display: inline;
}

.no-description {
  font-style: italic;
  opacity: 0.7;
  color: var(--color-text-secondary);
}

.edit-circle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(156, 106, 222, 0.1);
  border: 1px solid rgba(156, 106, 222, 0.3);
  border-radius: 30px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 6px 12px;
  font-size: 0.8rem;
  vertical-align: middle;
  margin-left: 8px;
  gap: 6px;
}

.edit-circle-btn:hover {
  background-color: rgba(156, 106, 222, 0.2);
  border-color: #9c6ade;
  color: #9c6ade;
  transform: translateY(-1px);
}

.edit-circle-btn svg {
  color: #9c6ade;
}

.edit-label {
  font-weight: 500;
  font-size: 0.75rem;
  color: inherit;
  font-family: inherit;
}

/* Circle actions */
.circle-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-button {
  background: linear-gradient(45deg, #9c6ade, #1dd1a1);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(156, 106, 222, 0.25);
}

.upload-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(156, 106, 222, 0.35);
}

.share-button {
  background: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.share-button:hover {
  background: rgba(156, 106, 222, 0.1);
  border-color: #9c6ade;
  color: #9c6ade;
  transform: translateY(-2px);
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .circle-header {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .title-section {
    padding-right: 0;
    width: 100%;
  }
  
  .circle-actions {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    gap: 0.8rem;
  }
}
</style> 