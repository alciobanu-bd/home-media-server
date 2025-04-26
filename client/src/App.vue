<template>
  <div id="app">
    <router-view />
    <upload-task-manager v-if="showUploadManager" @no-active-tasks="hideUploadManager" />
  </div>
</template>

<script>
import UploadTaskManager from './components/UploadTaskManager.vue';

export default {
  name: 'App',
  components: {
    UploadTaskManager
  },
  data() {
    return {
      showUploadManager: false
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
body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
}

#app {
  position: relative;
  min-height: 100vh;
}
</style> 