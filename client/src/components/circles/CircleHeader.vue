<template>
  <div class="circle-header-component">
    <div class="title-section">
      <div class="title-line">
        <h1>{{ name }}</h1>
        <button v-if="isAdmin" class="btn-icon-only edit-circle-btn" @click="$emit('edit')" title="Edit Circle Name & Description">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
      </div>
      <p v-if="description" class="description-text">
        {{ description }}
      </p>
      <p v-else class="no-description-text">
        No description provided for this circle.
      </p>
    </div>
    
    <div class="circle-actions">
      <button class="btn btn-primary upload-button" @click="$emit('upload')">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        Upload Media
      </button>
      <button class="btn btn-secondary share-button" @click="$emit('share-album')">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
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
.circle-header-component {
  display: flex;
  justify-content: space-between;
  align-items: flex-start; /* Align items to the top */
  padding: 1.5rem; /* Add padding for a card-like feel if desired, or rely on parent */
  background-color: var(--color-bg-secondary); /* Light background */
  border-radius: 12px;
  border: 1px solid var(--color-border-light);
  margin-bottom: 1.5rem; /* Space below header */
}

.title-section {
  flex: 1; /* Allow title section to take available space */
}

.title-line {
  display: flex;
  align-items: center;
  gap: 0.75rem; /* Space between title and edit button */
  margin-bottom: 0.5rem;
}

.title-section h1 {
  font-size: 2rem; /* Larger title */
  font-weight: 700;
  background: linear-gradient(90deg, var(--lumia-purple, #9c6ade), var(--lumia-green, #1dd1a1));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-family: 'Poppins', sans-serif;
  margin: 0; /* Reset margin */
  line-height: 1.2;
}

.description-text, .no-description-text {
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
  max-width: 700px; /* Prevent description from being too wide */
}

.no-description-text {
  font-style: italic;
  opacity: 0.8;
}

.btn-icon-only {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  padding: 6px;
  border-radius: 50%;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.btn-icon-only:hover {
  background-color: var(--color-hover);
  color: var(--lumia-primary, #9c6ade);
}

.edit-circle-btn svg {
  /* SVG inherits color from button */
}

.circle-actions {
  display: flex;
  gap: 0.75rem; /* Consistent gap for action buttons */
  align-items: center; /* Align buttons nicely */
  flex-shrink: 0; /* Prevent shrinking if title is long */
  margin-left: 1.5rem; /* Space between title section and actions */
}

/* Standardized button styles (should match global .btn styles if possible) */
.btn {
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-decoration: none;
}

.btn-primary {
  background: var(--lumia-gradient, linear-gradient(45deg, #9c6ade, #1dd1a1));
  color: white;
  border: none;
  box-shadow: var(--lumia-shadow-sm, 0 2px 8px rgba(156, 106, 222, 0.2));
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: var(--lumia-shadow-hover, 0 4px 12px rgba(156, 106, 222, 0.3));
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

.upload-button svg,
.share-button svg {
  margin-right: 6px; /* Keep if gap on .btn is not enough or for specific icon spacing */
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .circle-header-component {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .title-section h1 {
    font-size: 1.75rem;
  }

  .circle-actions {
    width: 100%;
    justify-content: flex-start; /* Align buttons to start on mobile */
    margin-left: 0;
  }

  .btn {
    flex-grow: 1; /* Make buttons take equal space if needed, or adjust individually */
    font-size: 0.85rem;
    padding: 0.5rem 0.8rem;
  }
  .btn-icon-only {
    padding: 4px;
  }
  .btn-icon-only svg {
    width:18px;
    height:18px;
  }
}
</style> 