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
  --color-focus: #e2e8f0;
  
  /* Status colors */
  --color-error: #ef4444;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  
  /* Misc */
  --border-radius: 4px;
  --spacing-unit: 8px;
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
  height: 60px;
  background-color: var(--color-bg-primary);
  border-bottom: 1px solid var(--color-focus);
  display: flex;
  align-items: center;
  padding: 0 16px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.header-left {
  flex: 1;
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-divider {
  width: 1px;
  height: 24px;
  background-color: var(--color-focus);
  margin: 0 8px;
}

.app-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
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
    padding: 0 8px;
    height: 50px;
  }
  
  .header-right {
    gap: 6px;
  }
  
  .app-title {
    font-size: 1.1rem;
  }
  
  .app-main {
    padding: 8px;
  }
}
</style> 