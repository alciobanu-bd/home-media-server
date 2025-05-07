<template>
  <div class="timeline-container-component">
    <div class="timeline-header">
      <h3 class="component-section-title">Recent Activity</h3>
      
      <div class="timeline-filters">
        <div class="filter-dropdown">
          <button class="filter-button" @click="toggleFilterMenu" :class="{ 'is-active': showFilterMenu }">
            <span>{{ selectedFilter }}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          
          <div class="filter-menu" v-if="showFilterMenu">
            <div 
              v-for="filter in filterOptions" 
              :key="filter.value"
              class="filter-option"
              :class="{ 'is-selected': selectedFilterValue === filter.value }"
              @click="setFilter(filter.value)"
            >
              {{ filter.label }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="loading && timeline.length === 0" class="timeline-state-container loading-state">
      <div class="loading-spinner"></div>
      <p>Loading timeline...</p>
    </div>
    
    <div v-else-if="timeline.length === 0" class="timeline-state-container empty-state">
      <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
        <path d="M12 6v6l4 2"></path>
      </svg>
      <p class="empty-state-title">No recent activity</p>
      <p class="empty-state-message">Shared files and album updates will appear here.</p>
    </div>
    
    <div v-else class="timeline-feed">
      <div v-for="(group, groupIndex) in groupedTimeline" :key="groupIndex" class="timeline-date-group">
        <div class="date-divider">
          <div class="date-line"></div>
          <div class="date-label">{{ group.date }}</div>
          <div class="date-line"></div>
        </div>
        
        <div 
          v-for="(activity, activityIndex) in group.activities" 
          :key="`${groupIndex}-${activityIndex}`" 
          class="timeline-item"
        >
          <div class="timeline-item-header">
            <div class="avatar-container">
              <img v-if="activity.owner.picture" :src="activity.owner.picture" :alt="activity.owner.name" class="avatar-img">
              <div v-else class="avatar-fallback">
                {{ getInitials(activity.owner.name) }}
              </div>
            </div>
            
            <div class="activity-meta">
              <div class="activity-description">
                <span class="username">{{ activity.owner.name }}</span>
                <span v-if="activity.type === 'file'" class="action-text">
                  shared {{ getFileCountSummary(activity.items.length) }}
                </span>
                <span v-else-if="activity.type === 'album'" class="action-text">
                  updated {{ getAlbumCountSummary(activity.items.length) }}
                </span>
              </div>
              <time class="timestamp" :datetime="activity.createdAt">
                {{ formatTimeAgo(activity.createdAt) }}
              </time>
            </div>
          </div>
          
          <div v-if="activity.type === 'file'" class="timeline-content files-grid">
            <CircleFileCard
              v-for="file in activity.items" 
              :key="file.id"
              :file="file"
              :apiBaseUrl="apiBaseUrl"
              @view-file="viewFile"
            />
          </div>
          
          <div v-else-if="activity.type === 'album'" class="timeline-content albums-container">
            <div 
              v-for="album in activity.items" 
              :key="album.id"
              class="album-card"
              @click="viewAlbum(album.id)"
              tabindex="0"
              role="button"
              @keydown.enter="viewAlbum(album.id)"
              @keydown.space.prevent="viewAlbum(album.id)"
            >
              <!-- Album preview grid -->
              <div class="album-preview-grid" v-if="album.previewFiles && album.previewFiles.length > 0">
                <div 
                  v-for="(preview, idx) in album.previewFiles.slice(0, 4)" 
                  :key="preview.id"
                  class="preview-item"
                  :style="{ gridArea: `area${idx + 1}` }"
                >
                  <img 
                    :src="`${apiBaseUrl}/thumbnails/${preview.id}.jpg`" 
                    :alt="preview.originalName"
                    class="preview-img"
                    loading="lazy"
                  />
                </div>
                <div v-if="album.previewFiles.length > 4" class="preview-overlay">
                  <span>+{{ album.previewFiles.length - 4 }}</span>
                </div>
              </div>
              
              <!-- Empty preview state with icon -->
              <div v-else class="empty-preview">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span>No previews</span>
              </div>
              
              <!-- Album info overlay -->
              <div class="album-info-overlay">
                <div class="album-meta">
                  <h4 class="album-name">{{ album.name }}</h4>
                  <div class="album-details">
                    <span class="album-count">{{ album.fileCount }} items</span>
                    <span class="view-text">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      View album
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="timeline.length > 0 && nextPageTimestamp" class="pagination">
        <button 
          class="btn-load-more"
          :disabled="loadingMore"
          @click="loadMore"
          :class="{ 'is-loading': loadingMore }"
        >
          <span v-if="loadingMore">
            <div class="btn-spinner"></div>
            Loading...
          </span>
          <span v-else>Load More Activity</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
const FUZZY_COUNT_THRESHOLD = 20;
import CircleFileCard from './CircleFileCard.vue';

export default {
  name: 'CircleTimeline',
  components: {
    CircleFileCard
  },
  props: {
    circleId: {
      type: String,
      required: true
    },
    timeline: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    loadingMore: {
      type: Boolean,
      default: false
    },
    nextPageTimestamp: {
      type: [Number, null],
      default: null
    },
    apiBaseUrl: {
      type: String,
      required: true
    }
  },
  
  emits: ['load-more', 'view-album', 'view-file'],
  
  data() {
    return {
      showFilterMenu: false,
      selectedFilterValue: 'all',
      filterOptions: [
        { label: 'All Activity', value: 'all' },
        { label: 'Files Only', value: 'file' },
        { label: 'Albums Only', value: 'album' }
      ]
    };
  },
  
  computed: {
    selectedFilter() {
      const option = this.filterOptions.find(opt => opt.value === this.selectedFilterValue);
      return option ? option.label : 'All Activity';
    },
    
    filteredTimeline() {
      if (this.selectedFilterValue === 'all') {
        return this.timeline;
      }
      
      return this.timeline.filter(item => item.type === this.selectedFilterValue);
    },
    
    groupedTimeline() {
      const groups = [];
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const todayStr = today.toDateString();
      const yesterdayStr = yesterday.toDateString();
      
      // Group activities by date
      this.filteredTimeline.forEach(activity => {
        const activityDate = new Date(activity.createdAt);
        const activityDateStr = activityDate.toDateString();
        
        let dateLabel;
        if (activityDateStr === todayStr) {
          dateLabel = 'Today';
        } else if (activityDateStr === yesterdayStr) {
          dateLabel = 'Yesterday';
        } else {
          // Format date: Jan 1, 2023
          dateLabel = activityDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
        }
        
        // Find existing group or create new one
        let group = groups.find(g => g.date === dateLabel);
        if (!group) {
          group = { date: dateLabel, activities: [] };
          groups.push(group);
        }
        
        group.activities.push(activity);
      });
      
      return groups;
    }
  },
  
  methods: {
    loadMore() {
      this.$emit('load-more');
    },
    
    viewAlbum(albumId) {
      this.$emit('view-album', albumId);
    },
    
    viewFile(fileId) {
      this.$emit('view-file', fileId);
    },
    
    getFileCountSummary(count) {
      if (count === 1) return 'a file';
      if (count > FUZZY_COUNT_THRESHOLD) return `${FUZZY_COUNT_THRESHOLD}+ files`;
      return `${count} files`;
    },
    
    getAlbumCountSummary(count) {
      if (count === 1) return 'an album';
      if (count > FUZZY_COUNT_THRESHOLD) return `${FUZZY_COUNT_THRESHOLD}+ albums`;
      return `${count} albums`;
    },
    
    getInitials(name) {
      if (!name) return '?';
      return name.split(' ')
        .map(part => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
    },
    
    formatTimeAgo(dateString) {
      try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) {
          return 'just now';
        }
        
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
          return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
        }
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
          return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
        }
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) {
          return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
        }
        
        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths < 12) {
          return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
        }
        
        const diffInYears = Math.floor(diffInMonths / 12);
        return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
      } catch (error) {
        return 'unknown time';
      }
    },
    
    toggleFilterMenu() {
      this.showFilterMenu = !this.showFilterMenu;
      
      if (this.showFilterMenu) {
        // Add click outside listener
        setTimeout(() => {
          document.addEventListener('click', this.closeFilterMenu);
        }, 0);
      }
    },
    
    closeFilterMenu(event) {
      if (!event.target.closest('.filter-dropdown')) {
        this.showFilterMenu = false;
        document.removeEventListener('click', this.closeFilterMenu);
      }
    },
    
    setFilter(value) {
      this.selectedFilterValue = value;
      this.showFilterMenu = false;
      document.removeEventListener('click', this.closeFilterMenu);
    }
  }
};
</script>

<style scoped>
.timeline-container-component {
  width: 100%;
  overflow: hidden;
}

.timeline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border-light);
}

.component-section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  background: linear-gradient(90deg, var(--lumia-purple, #9c6ade), var(--lumia-green, #1dd1a1));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.timeline-filters {
  display: flex;
  gap: 0.5rem;
}

.filter-dropdown {
  position: relative;
}

.filter-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  color: var(--color-text-primary);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-button:hover {
  background-color: var(--color-hover);
  border-color: var(--color-border);
}

.filter-button.is-active {
  border-color: var(--lumia-primary);
  box-shadow: 0 0 0 1px var(--lumia-primary-light);
}

.filter-button svg {
  width: 16px;
  height: 16px;
  transition: transform 0.2s ease;
}

.filter-button.is-active svg {
  transform: rotate(180deg);
}

.filter-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  min-width: 160px;
  background-color: var(--color-bg-primary);
  border-radius: 8px;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
  z-index: 10;
  overflow: hidden;
}

.filter-option {
  padding: 0.6rem 0.8rem;
  cursor: pointer;
  transition: background-color 0.15s ease;
  color: var(--color-text-primary);
  font-size: 0.9rem;
}

.filter-option:hover {
  background-color: var(--color-hover);
}

.filter-option.is-selected {
  background-color: var(--lumia-primary-light, rgba(156, 106, 222, 0.1));
  color: var(--lumia-primary);
  font-weight: 500;
}

.timeline-date-group {
  margin-bottom: 2rem;
}

.timeline-date-group:last-child {
  margin-bottom: 0;
}

.date-divider {
  display: flex;
  align-items: center;
  margin: 1.5rem 0 1rem;
}

.date-label {
  padding: 0 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.date-line {
  flex-grow: 1;
  height: 1px;
  background-color: var(--color-border-light);
}

.timeline-state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
  background-color: var(--color-bg-secondary);
  border-radius: 12px;
  min-height: 240px;
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(156, 106, 222, 0.2);
  border-radius: 50%;
  border-top-color: var(--lumia-primary, #9c6ade);
  animation: spin 1s linear infinite;
  margin-bottom: 1.25rem;
}

.loading-state p {
  font-size: 1.05rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.empty-state-icon {
  width: 56px;
  height: 56px;
  margin-bottom: 1.25rem;
  color: var(--color-text-tertiary);
  opacity: 0.8;
}

.empty-state-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 0.5rem 0;
}

.empty-state-message {
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.timeline-feed {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.timeline-item {
  background-color: var(--color-bg-primary);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-light);
  transform: translateZ(0);
  transition: box-shadow 0.3s ease;
  animation: fadeIn 0.5s ease forwards;
  will-change: transform, opacity;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.timeline-item-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border-bottom: 1px solid var(--color-border-extra-light);
  background: linear-gradient(
    to right,
    var(--color-bg-primary),
    var(--color-bg-primary) 80%,
    rgba(156, 106, 222, 0.03)
  );
}

.avatar-container {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid var(--lumia-primary-light, rgba(156, 106, 222, 0.5));
  box-shadow: 0 2px 10px rgba(156, 106, 222, 0.2);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--lumia-purple, #9c6ade), var(--lumia-green, #1dd1a1));
  color: white;
  font-weight: 600;
  font-size: 1rem;
}

.activity-meta {
  flex: 1;
}

.activity-description {
  font-size: 1rem;
  color: var(--color-text-primary);
  margin-bottom: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.username {
  font-weight: 700;
  background: linear-gradient(90deg, var(--lumia-purple, #9c6ade), var(--lumia-green, #1dd1a1));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.action-text {
  color: var(--color-text-primary);
}

.timestamp {
  font-size: 0.85rem;
  color: var(--color-text-tertiary);
  display: inline-block;
}

.timeline-content {
  padding: 1.25rem;
  background-color: var(--color-background);
}

/* Files grid styling */
.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}

/* Album container styling */
.albums-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.25rem;
}

.album-card {
  position: relative;
  aspect-ratio: 4/3;
  border-radius: 12px;
  overflow: hidden;
  background-color: var(--color-bg-tertiary);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transform: translateZ(0);
  transition: box-shadow 0.3s ease;
}

.album-card:hover {
  box-shadow: var(--shadow-lg, 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1));
}

.album-card:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--lumia-primary, #9c6ade);
}

.album-preview-grid {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-areas:
    "area1 area2"
    "area3 area4";
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.preview-item {
  overflow: hidden;
  position: relative;
}

.preview-item::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 70%, rgba(0, 0, 0, 0.2));
  pointer-events: none;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.album-card:hover .preview-img {
  transform: scale(1.08);
}

.preview-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.album-card:hover .preview-overlay {
  opacity: 1;
}

.empty-preview {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: var(--color-text-tertiary);
  background-color: var(--color-bg-secondary);
}

.empty-preview svg {
  width: 48px;
  height: 48px;
  opacity: 0.7;
}

.empty-preview span {
  font-size: 0.9rem;
  font-weight: 500;
}

.album-info-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0) 120px);
  color: white;
  transition: padding 0.3s ease;
}

.album-card:hover .album-info-overlay {
  padding-bottom: 1.25rem;
}

.album-meta {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.album-name {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.album-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.album-count {
  font-size: 0.85rem;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 4px;
  backdrop-filter: blur(4px);
}

.view-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  opacity: 0.9;
  transition: opacity 0.2s ease;
}

.view-text svg {
  width: 14px;
  height: 14px;
}

.album-card:hover .view-text {
  opacity: 1;
}

/* Pagination controls */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border-light);
}

.btn-load-more {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(90deg, var(--lumia-purple-light, rgba(156, 106, 222, 0.8)), var(--lumia-green-light, rgba(29, 209, 161, 0.8)));
  background-size: 200% 100%;
  animation: gradientShift 3s ease infinite;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 180px;
  box-shadow: 0 4px 12px rgba(156, 106, 222, 0.15);
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.btn-load-more:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(156, 106, 222, 0.25);
}

.btn-load-more:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(156, 106, 222, 0.15);
}

/* Animation delay for cascade effect */
.timeline-item:nth-child(1) { animation-delay: 0s; }
.timeline-item:nth-child(2) { animation-delay: 0.05s; }
.timeline-item:nth-child(3) { animation-delay: 0.1s; }
.timeline-item:nth-child(4) { animation-delay: 0.15s; }
.timeline-item:nth-child(5) { animation-delay: 0.2s; }
.timeline-item:nth-child(6) { animation-delay: 0.25s; }
.timeline-item:nth-child(7) { animation-delay: 0.3s; }
.timeline-item:nth-child(8) { animation-delay: 0.35s; }
.timeline-item:nth-child(9) { animation-delay: 0.4s; }
.timeline-item:nth-child(10) { animation-delay: 0.45s; }

/* Scroll indicator for new items */
.scroll-indicator {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--lumia-purple), var(--lumia-green));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  opacity: 0;
  transform: scale(0);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.scroll-indicator.visible {
  opacity: 1;
  transform: scale(1);
}

.scroll-indicator svg {
  width: 20px;
  height: 20px;
}

/* Skeleton loading state */
.skeleton-timeline {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1rem;
}

.skeleton-item {
  background-color: var(--color-bg-primary);
  border-radius: 12px;
  border: 1px solid var(--color-border-light);
  overflow: hidden;
}

.skeleton-header {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  border-bottom: 1px solid var(--color-border-extra-light);
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(110deg, var(--color-bg-tertiary) 8%, var(--color-bg-secondary) 18%, var(--color-bg-tertiary) 33%);
  background-size: 200% 100%;
  animation: shine 1.5s linear infinite;
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-line {
  height: 14px;
  width: 60%;
  border-radius: 4px;
  background: linear-gradient(110deg, var(--color-bg-tertiary) 8%, var(--color-bg-secondary) 18%, var(--color-bg-tertiary) 33%);
  background-size: 200% 100%;
  animation: shine 1.5s linear infinite;
}

.skeleton-line-short {
  width: 30%;
}

.skeleton-body {
  padding: 1.25rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.skeleton-card {
  height: 90px;
  border-radius: 8px;
  background: linear-gradient(110deg, var(--color-bg-tertiary) 8%, var(--color-bg-secondary) 18%, var(--color-bg-tertiary) 33%);
  background-size: 200% 100%;
  animation: shine 1.5s linear infinite;
}

@keyframes shine {
  to {
    background-position-x: -200%;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .files-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
  
  .timeline-item-header {
    padding: 1rem;
  }
  
  .avatar-container {
    width: 40px;
    height: 40px;
  }
  
  .albums-container {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

@media (max-width: 480px) {
  .files-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
  
  .albums-container {
    grid-template-columns: 1fr;
  }
  
  .preview-item,
  .preview-more {
    width: 60px;
    height: 60px;
  }
  
  .album-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .file-type-badge, 
  .file-size-badge {
    font-size: 0.65rem;
    padding: 3px 6px;
  }
}
</style> 