<template>
  <button class="theme-toggle" @click="toggleTheme" :title="themeTitle">
    <img v-if="isDarkMode" :src="baseUrl + 'img/sun.svg'" alt="Switch to light mode" />
    <img v-else :src="baseUrl + 'img/moon.svg'" alt="Switch to dark mode" />
  </button>
</template>

<script>
export default {
  name: 'ThemeToggle',
  data() {
    return {
      isDarkMode: false,
      baseUrl: process.env.BASE_URL || '/'
    };
  },
  computed: {
    themeTitle() {
      return this.isDarkMode ? 'Switch to light mode' : 'Switch to dark mode';
    }
  },
  mounted() {
    // Check localStorage and system preference on mount
    this.initializeTheme();
  },
  methods: {
    initializeTheme() {
      // Check if theme is stored in localStorage
      const savedTheme = localStorage.getItem('theme');
      
      // Check system preference if no saved theme
      const prefersDark = window.matchMedia && 
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Set theme based on saved preference or system preference
      this.isDarkMode = savedTheme === 'dark' || 
        (savedTheme === null && prefersDark);
      
      // Apply theme
      document.documentElement.setAttribute(
        'data-theme', 
        this.isDarkMode ? 'dark' : 'light'
      );
    },
    toggleTheme() {
      // Toggle dark mode
      this.isDarkMode = !this.isDarkMode;
      
      // Update document theme
      document.documentElement.setAttribute(
        'data-theme', 
        this.isDarkMode ? 'dark' : 'light'
      );
      
      // Save to localStorage
      localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    }
  }
};
</script>

<style>
.theme-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.theme-toggle:hover {
  background-color: var(--color-hover);
}

.theme-toggle img {
  width: 24px;
  height: 24px;
  color: var(--color-text);
}
</style> 