<template>
  <div id="app">
    <header class="app-header">
      <div class="header-left">
        <div class="title-container">
          <img :src="baseUrl + 'img/logo.svg'" alt="Lumia Logo" class="logo" />
          <div class="brand">
            <h1 class="brand-name">Lumia</h1>
            <p class="brand-tagline">{{ currentTagline }}</p>
          </div>
        </div>
        <nav class="main-nav">
          <router-link to="/" class="nav-link">
            <svg class="nav-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"></rect>
              <rect x="14" y="3" width="7" height="7" rx="1"></rect>
              <rect x="14" y="14" width="7" height="7" rx="1"></rect>
              <rect x="3" y="14" width="7" height="7" rx="1"></rect>
            </svg>
            <span>Gallery</span>
          </router-link>
          <router-link to="/albums" class="nav-link">
            <svg class="nav-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <rect x="7" y="7" width="4" height="10"></rect>
              <rect x="13" y="7" width="4" height="10"></rect>
            </svg>
            <span>Albums</span>
          </router-link>
          <router-link to="/circles" class="nav-link">
            <svg class="nav-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"></path>
            </svg>
            <span>Circles</span>
          </router-link>
          <router-link to="/about" class="nav-link">
            <svg class="nav-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span>About</span>
          </router-link>
          <!-- Additional menu items can be added here -->
        </nav>
      </div>
      <div class="header-right">
        <gallery-controls />
        <div class="header-divider"></div>
        <theme-toggle class="theme-toggle" />
        <user-profile />
      </div>
    </header>
    <div class="router-view-container">
      <router-view v-if="appReady" />
    </div>
    <div v-if="!appReady" class="app-loading">
      <div class="loading-spinner"></div>
      <p>Loading application...</p>
    </div>
    <upload-task-manager v-if="showUploadManager" @no-active-tasks="hideUploadManager" />
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import UploadTaskManager from './components/UploadTaskManager.vue';
import UserProfile from './components/UserProfile.vue';
import ThemeToggle from './components/ThemeToggle.vue';
import GalleryControls from './components/GalleryControls.vue';
import authStore from './store/authStore';

export default {
  name: 'App',
  components: {
    UploadTaskManager,
    UserProfile,
    ThemeToggle,
    GalleryControls
  },
  setup() {
    const appReady = ref(false);

    onMounted(async () => {
      try {
        // Check authentication status on app start
        await authStore.checkAuth();
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        // Set app as ready regardless of auth status
        appReady.value = true;
      }
    });

    return {
      appReady
    };
  },
  data() {
    return {
      showUploadManager: false,
      baseUrl: process.env.BASE_URL || '/',
      // Define happy colors and app name
      appName: 'Lumia',
      happyColors: [
        '#ff6b6b', // Red
        '#feca57', // Orange
        '#48dbfb', // Blue
        '#1dd1a1', // Green
        '#9c6ade', // Purple
        '#ff9ff3', // Pink
        '#feca57', // Orange (repeat for spacing)
        '#48dbfb', // Blue
        '#1dd1a1', // Green
        '#ff6b6b', // Red
        '#feca57', // Orange
        '#48dbfb', // Blue 
      ],
      taglines: [
        "Illuminate Your Media",
        "Share Smarter, Not Wider",
        "The Social Network for Your Inner Circle",
        "Share with Who Matters Most",
        "Where Family and Friends Connect Privately",
        "Share Naturally, Within Your Tribe",
        "Share What Matters, With Who Matters",
        "Where Sharing Feels Right",
        "The Private Social",
        "Moments Meant for Your Closest",
        "For the People You Cherish Most",
        "Keep Your Loved Ones in the Loop, Privately",
      ],
      currentTagline: ""
    };
  },
  computed: {
    // Compute letter array for v-for
    appNameLetters() {
      return this.appName.split('');
    }
  },
  created() {
    // Check if there are any active upload tasks in localStorage
    this.checkForActiveTasks();
    
    // Listen for upload events
    window.addEventListener('upload-started', () => {
      this.showUploadManager = true;
    });
    
    window.addEventListener('upload-completed', this.checkForActiveTasks);
    
    // Set the tagline
    this.setTagline();
  },
  beforeUnmount() {
    window.removeEventListener('upload-completed', this.checkForActiveTasks);
  },
  methods: {
    checkForActiveTasks() {
      const uploadTasks = localStorage.getItem('uploadTasks');
      if (uploadTasks) {
        const tasks = JSON.parse(uploadTasks);
        // Show only if there are active tasks (not completed or cancelled)
        const activeTasks = tasks.filter(task => 
          task.status !== 'completed' && task.status !== 'cancelled'
        );
        this.showUploadManager = activeTasks.length > 0;
      } else {
        this.showUploadManager = false;
      }
    },
    hideUploadManager() {
      this.showUploadManager = false;
    },
    setTagline() {
      try {
        // Check if we already have a tagline in local storage
        let taglineData = localStorage.getItem('lumia_tagline');
        let tagline = null;
        let shouldSetNew = true;
        
        if (taglineData) {
          try {
            const data = JSON.parse(taglineData);
            tagline = data.tagline;
            
            // Check if the tagline is still valid (less than 1 day old)
            const now = new Date().getTime();
            const storedTime = data.timestamp;
            const dayInMs = 24 * 60 * 60 * 1000;
            
            // If the tagline is less than a day old, use it
            if (now - storedTime < dayInMs) {
              shouldSetNew = false;
            }
          } catch (e) {
            console.warn('Invalid tagline data format, will select a new one');
          }
        }
        
        if (shouldSetNew) {
          // Choose a random tagline
          const randomIndex = Math.floor(Math.random() * this.taglines.length);
          tagline = this.taglines[randomIndex];
          
          // Save it to local storage with a timestamp
          const data = {
            tagline: tagline,
            timestamp: new Date().getTime()
          };
          localStorage.setItem('lumia_tagline', JSON.stringify(data));
        }
        
        this.currentTagline = tagline;
      } catch (error) {
        // Fallback in case of storage issues
        console.error('Error accessing local storage:', error);
        const randomIndex = Math.floor(Math.random() * this.taglines.length);
        this.currentTagline = this.taglines[randomIndex];
      }
    }
  }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

:root {
  /* Primary colors - Slightly softer blue */
  --color-primary: #4f8ff7; /* Adjusted from #3b82f6 */
  --color-primary-dark: #3a7bd5; /* Adjusted */
  --color-primary-light: #a1c4fd; /* Adjusted */
  
  /* Text colors - Slightly adjust secondary text */
  --color-text-primary: #1e293b;
  --color-text-secondary: #526176; /* Adjusted from #64748b */
  --color-text-light: #f8fafc;
  
  /* Background colors - Use slightly off-white */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f7f9fc; /* Adjusted from #f8fafc */
  --color-bg-tertiary: #eef2f7; /* Adjusted from #f1f5f9 */
  
  /* Interaction colors */
  --color-hover: #eef2f7; /* Adjusted from #f1f5f9 */
  --color-hover-rgb: 238, 242, 247; /* Adjusted */
  --color-hover-dark: #dfe6f0; /* Adjusted from #e2e8f0 */
  --color-focus: #dfe6f0; /* Adjusted from #e2e8f0 */
  --color-focus-rgb: 223, 230, 240; /* Adjusted */
  
  /* Status colors (keeping these as they are generally standard) */
  --color-error: #ef4444;
  --color-error-dark: #dc2626;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  
  /* Card colors - Slightly softer border */
  --color-card-background: #ffffff;
  --color-border: #e5e9f0; /* Adjusted from #e2e8f0 */
  
  /* Misc - Increase border radius slightly */
  --border-radius: 6px; /* Adjusted from 4px */
  --border-radius-lg: 10px; /* Adjusted from 8px */
  --spacing-unit: 8px;
  --header-height: 96px; /* Increased from 80px for a taller header */
  --header-height-mobile: 80px; /* Increased from 68px for mobile */
  --transition-speed: 0.25s; /* Slightly slower for smoother feel */
  
  /* RGB versions of colors */
  --color-primary-rgb: 79, 143, 247; /* Adjusted */
  --color-bg-tertiary-rgb: 238, 242, 247; /* Adjusted */

  /* Add base transition */
  --base-transition: all var(--transition-speed) ease-in-out;
}

body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--color-text-primary);
  background-color: var(--color-bg-secondary);
  /* Add transition to body background for theme changes */
  transition: background-color var(--transition-speed) ease-in-out, color var(--transition-speed) ease-in-out;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  height: var(--header-height);
  background-color: var(--color-bg-primary);
  /* Refined Gradient and Border */
  background-image: linear-gradient(to bottom, var(--color-bg-primary), var(--color-bg-secondary));
  border-bottom: 1px solid var(--color-border); /* Use updated border color */
  display: flex;
  align-items: center;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 100;
  /* Softer Shadow */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  transition: height var(--transition-speed) ease, box-shadow var(--transition-speed) ease;
}

.header-left {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 24px;
}

.title-container {
  display: flex;
  align-items: center;
  gap: 12px;
  transition: transform var(--transition-speed) ease;
  cursor: default; /* Default arrow cursor */
}

.title-container:hover {
  transform: translateY(-1px);
}

.logo {
  width: 70px !important;
  height: 70px !important;
  object-fit: contain;
  transition: transform var(--transition-speed) ease;
  cursor: default; /* Default arrow cursor */
}

.title-container:hover .logo {
  transform: scale(1.05);
}

.app-title {
  font-size: 1.8rem;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  white-space: nowrap;
}

/* Style individual letters */
.app-title span {
  display: inline-block;
  transition: transform 0.2s ease-out;
}

.app-title span:hover {
  transform: scale(1.1) translateY(-2px);
}

/* Handle spaces */
.app-title span.letter-space {
  width: 0.3em;
}

.title-container:hover .app-title span {
  /* Optional: Add hover effect for the whole title container */
}

.header-center {
  display: flex;
  justify-content: center;
}

.main-nav {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: 8px;
}

.nav-link {
  padding: 10px 18px;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-weight: 500;
  font-size: 1.05rem;
  border-radius: 30px; /* More pill-shaped */
  transition: var(--base-transition);
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid transparent;
}

.nav-link .nav-icon {
  stroke: currentColor;
  transition: transform 0.2s ease;
  width: 20px;
  height: 20px;
}

.nav-link img.nav-icon {
  width: 18px;
  height: 18px;
  filter: none; /* Allow SVG to use currentColor */
}

.nav-link:hover {
  color: var(--color-primary);
  background-color: var(--color-hover);
  border-color: var(--color-border);
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.nav-link:hover .nav-icon {
  transform: scale(1.1);
}

.nav-link.router-link-active {
  color: var(--color-primary);
  font-weight: 600;
  background-color: rgba(var(--color-primary-rgb), 0.05);
  border-color: rgba(var(--color-primary-rgb), 0.2);
}

.nav-link.router-link-active:after {
  content: none;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-divider {
  width: 1px;
  height: 32px; /* Increased height */
  background-color: var(--color-border); /* Use border color */
  margin: 0 12px; /* Adjusted margin */
  opacity: 0.8;
}

.app-main {
  flex: 1;
  padding: 16px;
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .app-header {
    padding: 0 16px;
    height: var(--header-height-mobile);
  }
  
  .header-right {
    gap: 14px; /* Increased gap slightly */
  }
  
  .app-title {
    font-size: 1.6rem; /* Adjusted */
  }
  
  .logo {
    width: 60px !important;
    height: 60px !important;
  }
  
  .header-divider {
    height: 24px; /* Adjusted */
    margin: 0 6px;
  }
  
  .brand-name {
    font-size: 1.8rem;
  }
  
  .brand-tagline {
    font-size: 0.9rem;
  }
  
  .title-container {
    gap: 8px;
  }
  
  .nav-link {
    padding: 8px 12px; /* Adjusted */
    font-size: 1rem;
  }
  
  .app-main {
    padding: 12px;
  }
}

/* Loading spinner animation */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-spinner {
  border: 3px solid rgba(var(--color-primary-rgb, 79, 143, 247), 0.2); /* Updated RGB */
  border-top: 3px solid var(--color-primary);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

.app-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 16px;
  color: var(--color-text-secondary);
  background-color: var(--color-bg-secondary);
}

/* Brand styles for header */
.brand {
  display: flex;
  flex-direction: column;
  margin-left: 12px;
  cursor: default; /* Default arrow cursor */
}
.brand-name {
  font-size: 2.1rem;
  font-weight: 700;
  font-family: 'Poppins', sans-serif;
  background: linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #1dd1a1, #9c6ade, #ff9ff3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  cursor: default; /* Default arrow cursor */
}
.brand-tagline {
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin: 0;
  cursor: default; /* Default arrow cursor */
}

/* Dark mode enhancements for navigation */
[data-theme="dark"] .nav-link {
  color: #cbd5e1; /* Lighter text color in dark mode */
  background-color: rgba(51, 65, 85, 0.4); /* Subtle background even for non-active state */
  border: 1px solid rgba(51, 65, 85, 0.8); /* More visible border */
}

[data-theme="dark"] .nav-link:hover {
  background-color: rgba(51, 65, 85, 0.8); /* Stronger background on hover */
  border-color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2); /* Enhanced shadow */
}

[data-theme="dark"] .nav-link.router-link-active {
  background-color: rgba(var(--color-primary-rgb), 0.2); /* Stronger active background */
  border-color: var(--color-primary);
  color: var(--color-primary); /* Brighter text for active item */
  box-shadow: 0 0 0 1px rgba(var(--color-primary-rgb), 0.5); /* Outline glow effect */
}

.router-view-container {
  background-color: var(--color-background);
  min-height: calc(100vh - var(--header-height));
}

@media (max-width: 768px) {
  .router-view-container {
    min-height: calc(100vh - var(--header-height-mobile));
  }
}

[data-theme="dark"] .router-view-container {
  background-color: var(--color-background) !important;
}
</style> 