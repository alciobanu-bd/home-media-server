<template>
  <div class="circle-tabs-component">
    <div class="tabs-nav">
      <button 
        class="tab-link" 
        :class="{ 'active': modelValue === 'timeline' }"
        @click="$emit('update:modelValue', 'timeline')"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 20v-6M12 8V2M21 12h-6M9 12H3M19.07 4.93l-4.24 4.24M4.93 19.07l4.24-4.24M19.07 19.07l-4.24-4.24M4.93 4.93l4.24 4.24"/>
        </svg>
        Timeline
      </button>
      
      <button 
        class="tab-link" 
        :class="{ 'active': modelValue === 'albums' }"
        @click="$emit('update:modelValue', 'albums')"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
        Albums
      </button>
      
      <button 
        class="tab-link" 
        :class="{ 'active': modelValue === 'files' }"
        @click="$emit('update:modelValue', 'files')"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
          <polyline points="13 2 13 9 20 9"></polyline>
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
.circle-tabs-component {
  width: 100%;
  background-color: var(--color-bg-primary); /* Match parent background */
  position: sticky;
  top: 0; /* Adjust if there's a global sticky header */
  z-index: 100; /* Ensure tabs stay on top of content below */
  border-bottom: 1px solid var(--color-border-light);
  /* box-shadow: 0 2px 4px rgba(0,0,0,0.03); Optional subtle shadow */
}

.tabs-nav {
  display: flex;
  align-items: stretch; /* Make buttons take full height of nav bar */
  /* No margin-bottom here, parent .circle-content or .tab-content will have padding */
  border-top-left-radius: 10px; /* If tabs are at the very top of a card-like content area */
  border-top-right-radius: 10px;
  overflow-x: auto; /* For responsiveness on smaller screens */
  /* Add some padding if tabs don't start at the very edge of their container */
  padding: 0 0.75rem; 
}

.tab-link {
  padding: 0.85rem 1.25rem; /* Adjusted padding */
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 0.95rem; /* Slightly adjusted font size */
  font-weight: 600;
  color: var(--color-text-secondary);
  transition: color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.6rem; /* Space between icon and text */
  position: relative;
  border-bottom: 3px solid transparent; /* Active indicator pre-allocation */
  margin-bottom: -1px; /* Offset the parent's border-bottom to make tab border connect */
  white-space: nowrap; /* Prevent text wrapping */
}

.tab-link:hover {
  color: var(--lumia-primary, #9c6ade);
  background-color: var(--color-hover-light);
}

.tab-link.active {
  color: var(--lumia-primary, #9c6ade);
  border-bottom-color: var(--lumia-primary, #9c6ade);
  font-weight: 600;
}

.tab-link svg {
  transition: color 0.2s ease; /* SVG color transition */
  /* color property will be inherited from .tab-link or overridden by .active */
}

/* Responsive Tab Adjustments */
@media (max-width: 768px) {
  .tabs-nav {
    /* overflow-x: auto; Already set */
    /* padding-bottom: 2px; /* Might not be needed with current border approach */
  }
  
  .tab-link {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .tab-link {
    padding: 0.6rem 0.75rem; /* Further reduce padding */
    font-size: 0.85rem;
    gap: 0.4rem;
  }
  .tab-link svg {
    width: 16px;
    height: 16px;
  }
  .tabs-nav {
    /* justify-content: space-around; Or let it scroll naturally */
     padding: 0 0.25rem; 
  }
}
</style> 