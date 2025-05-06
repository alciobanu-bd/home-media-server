<template>
  <div class="circle-tabs">
    <div class="tabs-header">
      <button 
        class="tab-button" 
        :class="{ 'active': modelValue === 'timeline' }"
        @click="$emit('update:modelValue', 'timeline')"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 20v-6M12 8V2M21 12h-6M9 12H3M19.07 4.93l-4.24 4.24M4.93 19.07l4.24-4.24M19.07 19.07l-4.24-4.24M4.93 4.93l4.24 4.24"/>
        </svg>
        Timeline
      </button>
      
      <button 
        class="tab-button" 
        :class="{ 'active': modelValue === 'albums' }"
        @click="$emit('update:modelValue', 'albums')"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="2" width="20" height="20" rx="2"/>
          <circle cx="8.5" cy="8.5" r="2"/>
          <path d="M20 15l-4.5-4.5-6.5 6.5"/>
        </svg>
        Albums
      </button>
      
      <button 
        class="tab-button" 
        :class="{ 'active': modelValue === 'files' }"
        @click="$emit('update:modelValue', 'files')"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-7-7z"/>
          <path d="M13 2v7h7"/>
        </svg>
        Files
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CircleTabs',
  props: {
    modelValue: {
      type: String,
      required: true
    }
  },
  
  emits: ['update:modelValue']
};
</script>

<style scoped>
.circle-tabs {
  width: 100%;
}

.tabs-header {
  display: flex;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 1.5rem;
  position: sticky;
  top: 0;
  background-color: var(--color-bg-primary);
  z-index: 10;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

.tab-button {
  padding: 1rem 1.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  border-bottom: 2px solid transparent;
}

.tab-button:hover {
  color: var(--primary-color);
}

.tab-button.active {
  color: var(--primary-color);
  border-bottom: 2px solid var(--primary-color);
}

.tab-button svg {
  color: inherit;
}

/* Responsive Tab Adjustments */
@media (max-width: 768px) {
  .tabs-header {
    overflow-x: auto;
    padding-bottom: 2px; /* Prevents cut-off of active border */
  }
  
  .tab-button {
    padding: 0.75rem 1rem;
    white-space: nowrap;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .tab-button {
    padding: 0.75rem 0.5rem;
  }
  
  .tabs-header {
    justify-content: space-between;
  }
}
</style> 