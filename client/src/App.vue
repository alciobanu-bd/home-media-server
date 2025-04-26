<template>
  <div id="app">
    <header class="app-header">
      <div class="header-left">
        <div class="title-container">
          <img :src="baseUrl + 'img/logo.svg'" alt="Media Gallery Logo" class="logo" />
          <div class="app-title">Media Server</div>
        </div>
      </div>
      <div class="header-center">
        <nav class="main-nav">
          <router-link to="/" class="nav-link">Gallery</router-link>
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
    <router-view v-if="appReady" />
    <div v-else class="app-loading">
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
      baseUrl: process.env.BASE_URL || '/'
    };
  },
  created() {
    // Check if there are any active upload tasks in localStorage
    this.checkForActiveTasks();
    
    // Listen for upload events
    window.addEventListener('upload-started', () => {
      this.showUploadManager = true;
    });
    
    window.addEventListener('upload-completed', this.checkForActiveTasks);
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
    }
  }
};
</script>

<style>
:root {
  /* Primary colors */
  --color-primary: #3b82f6;
  --color-primary-dark: #2563eb;
  --color-primary-light: #93c5fd;
  
  /* Text colors */
  --color-text-primary: #1e293b;
  --color-text-secondary: #64748b;
  --color-text-light: #f8fafc;
  
  /* Background colors */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8fafc;
  --color-bg-tertiary: #f1f5f9;
  
  /* Interaction colors */
  --color-hover: #f1f5f9;
  --color-hover-rgb: 241, 245, 249;
  --color-hover-dark: #e2e8f0;
  --color-focus: #e2e8f0;
  --color-focus-rgb: 226, 232, 240;
  
  /* Status colors */
  --color-error: #ef4444;
  --color-error-dark: #dc2626;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  
  /* Card colors */
  --color-card-background: #ffffff;
  --color-border: #e2e8f0;
  
  /* Misc */
  --border-radius: 4px;
  --border-radius-lg: 8px;
  --spacing-unit: 8px;
  --header-height: 64px;
  --header-height-mobile: 56px;
  --transition-speed: 0.2s;
  
  /* RGB versions of colors */
  --color-primary-rgb: 59, 130, 246;
  --color-bg-tertiary-rgb: 241, 245, 249;
}

body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--color-text-primary);
  background-color: var(--color-bg-secondary);
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  height: var(--header-height);
  background-color: var(--color-bg-primary);
  background-image: linear-gradient(to bottom, var(--color-bg-primary), rgba(var(--color-bg-tertiary-rgb, 241, 245, 249), 0.5));
  border-bottom: 1px solid rgba(var(--color-focus-rgb, 226, 232, 240), 0.7);
  display: flex;
  align-items: center;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03);
  transition: height var(--transition-speed) ease, box-shadow var(--transition-speed) ease;
}

.header-left {
  flex: 1;
  display: flex;
  align-items: center;
}

.title-container {
  display: flex;
  align-items: center;
  gap: 12px;
  transition: transform var(--transition-speed) ease;
}

.title-container:hover {
  transform: translateY(-1px);
}

.logo {
  width: 36px;
  height: 36px;
  object-fit: contain;
  transition: transform var(--transition-speed) ease;
}

.title-container:hover .logo {
  transform: scale(1.05);
}

.app-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: -0.01em;
  display: flex;
  align-items: center;
  transition: color var(--transition-speed) ease;
}

.title-container:hover .app-title {
  color: var(--color-primary-dark);
}

.header-center {
  display: flex;
  justify-content: center;
}

.main-nav {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-link {
  padding: 6px 12px;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  border-radius: var(--border-radius);
  transition: all var(--transition-speed) ease;
  position: relative;
}

.nav-link:hover {
  color: var(--color-primary);
  background-color: rgba(var(--color-hover-rgb, 241, 245, 249), 0.6);
}

.nav-link.router-link-active {
  color: var(--color-primary);
  font-weight: 600;
}

.nav-link.router-link-active:after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--color-primary);
  border-radius: 2px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-divider {
  width: 1px;
  height: 28px;
  background-color: var(--color-focus);
  margin: 0 4px;
  opacity: 0.7;
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
    gap: 8px;
  }
  
  .app-title {
    font-size: 1.2rem;
  }
  
  .logo {
    width: 30px;
    height: 30px;
  }
  
  .header-divider {
    height: 24px;
    margin: 0 4px;
  }
  
  .title-container {
    gap: 8px;
  }
  
  .nav-link {
    padding: 4px 8px;
    font-size: 0.9rem;
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
  border: 3px solid rgba(var(--color-primary-rgb, 59, 130, 246), 0.2);
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
}
</style> 