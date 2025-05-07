<template>
  <div class="circle-tabs-component">
    <div class="tabs-nav">
      <button 
        class="tab-link" 
        :class="{ 'active': modelValue === 'timeline' }"
        @click="$emit('update:modelValue', 'timeline')"
      >
        <div class="tab-icon">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20v-6M12 8V2M21 12h-6M9 12H3M19.07 4.93l-4.24 4.24M4.93 19.07l4.24-4.24M19.07 19.07l-4.24-4.24M4.93 4.93l4.24 4.24"/>
          </svg>
        </div>
        <span class="tab-label">Timeline</span>
        <span v-if="timelineCount > 0" class="tab-count">{{ formatCount(timelineCount) }}</span>
      </button>
      
      <button 
        class="tab-link" 
        :class="{ 'active': modelValue === 'albums' }"
        @click="$emit('update:modelValue', 'albums')"
      >
        <div class="tab-icon">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        </div>
        <span class="tab-label">Albums</span>
        <span v-if="albumsCount > 0" class="tab-count">{{ formatCount(albumsCount) }}</span>
      </button>
      
      <button 
        class="tab-link" 
        :class="{ 'active': modelValue === 'files' }"
        @click="$emit('update:modelValue', 'files')"
      >
        <div class="tab-icon">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
            <polyline points="13 2 13 9 20 9"></polyline>
          </svg>
        </div>
        <span class="tab-label">Files</span>
        <span v-if="filesCount > 0" class="tab-count">{{ formatCount(filesCount) }}</span>
      </button>
      
      <button 
        class="tab-link" 
        :class="{ 'active': modelValue === 'members' }"
        @click="$emit('update:modelValue', 'members')"
      >
        <div class="tab-icon">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <span class="tab-label">Members</span>
        <span v-if="membersCount > 0" class="tab-count">{{ formatCount(membersCount) }}</span>
      </button>
      
      <div class="tab-indicator" :style="indicatorStyle"></div>
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
    },
    timelineCount: {
      type: Number,
      default: 0
    },
    albumsCount: {
      type: Number,
      default: 0
    },
    filesCount: {
      type: Number,
      default: 0
    },
    membersCount: {
      type: Number,
      default: 0
    }
  },
  
  emits: ['update:modelValue'],
  
  data() {
    return {
      indicatorPosition: 0,
      indicatorWidth: 0
    };
  },
  
  computed: {
    indicatorStyle() {
      return {
        transform: `translateX(${this.indicatorPosition}px)`,
        width: `${this.indicatorWidth}px`
      };
    }
  },
  
  methods: {
    formatCount(count) {
      if (count > 999) {
        return Math.floor(count / 1000) + 'k';
      }
      return count;
    },
    
    updateIndicator() {
      this.$nextTick(() => {
        const activeTab = this.$el.querySelector('.tab-link.active');
        if (activeTab) {
          this.indicatorPosition = activeTab.offsetLeft;
          this.indicatorWidth = activeTab.offsetWidth;
        }
      });
    }
  },
  
  watch: {
    modelValue() {
      this.updateIndicator();
    }
  },
  
  mounted() {
    this.updateIndicator();
    window.addEventListener('resize', this.updateIndicator);
  },
  
  beforeUnmount() {
    window.removeEventListener('resize', this.updateIndicator);
  }
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  overflow: hidden; /* For the sliding indicator */
}

.tabs-nav {
  display: flex;
  align-items: stretch; /* Make buttons take full height of nav bar */
  border-top-left-radius: 10px; /* If tabs are at the very top of a card-like content area */
  border-top-right-radius: 10px;
  overflow-x: auto; /* For responsiveness on smaller screens */
  padding: 0 1rem;
  position: relative; /* For the sliding indicator */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

.tabs-nav::-webkit-scrollbar {
  display: none; /* Chrome/Safari/Opera */
}

.tab-link {
  padding: 1rem 1.25rem;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  transition: color 0.3s ease, transform 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.6rem; /* Space between icon and text */
  position: relative;
  margin-bottom: -1px; /* Offset the parent's border-bottom */
  white-space: nowrap; /* Prevent text wrapping */
  flex-shrink: 0; /* Prevent tab shrinking */
}

.tab-link:hover {
  color: var(--lumia-primary, #9c6ade);
  transform: translateY(-1px);
}

.tab-link.active {
  color: var(--lumia-primary, #9c6ade);
  font-weight: 600;
}

.tab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-link svg {
  transition: transform 0.3s ease, color 0.3s ease;
}

.tab-link.active svg {
  transform: scale(1.1);
}

.tab-label {
  position: relative;
}

.tab-count {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: linear-gradient(135deg, var(--lumia-purple, #9c6ade), var(--lumia-accent, #1dd1a1));
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 9px;
  margin-left: 4px;
  transform: scale(0.9);
}

/* Animated sliding indicator */
.tab-indicator {
  position: absolute;
  bottom: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--lumia-purple, #9c6ade), var(--lumia-accent, #1dd1a1));
  transition: transform 0.3s cubic-bezier(0.33, 1, 0.68, 1), width 0.3s cubic-bezier(0.33, 1, 0.68, 1);
  border-radius: 3px 3px 0 0;
  z-index: 1;
}

/* Responsive Tab Adjustments */
@media (max-width: 768px) {
  .tabs-nav {
    padding: 0 0.5rem;
    justify-content: space-between;
  }
  
  .tab-link {
    padding: 0.85rem 1rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .tab-link {
    padding: 0.75rem 0.8rem;
    gap: 0.4rem;
  }
  
  .tab-label {
    font-size: 0.85rem;
  }
  
  .tab-icon svg {
    width: 16px;
    height: 16px;
  }
}

/* For very small screens, show icons only */
@media (max-width: 360px) {
  .tab-link {
    padding: 0.75rem 0.65rem;
  }
  
  .tab-count {
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(25%, -25%) scale(0.8);
  }
}
</style> 