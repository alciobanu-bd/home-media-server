<template>
  <div class="theme-toggle-container">
    <button class="theme-toggle" @click="toggleTheme" :title="themeTitle">
      <svg v-if="isDarkMode" class="sun-icon" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.65 0-3 1.35-3 3s1.35 3 3 3 3-1.35 3-3-1.35-3-3-3zm0-3V3c0-.55-.45-1-1-1s-1 .45-1 1v3c0 .55.45 1 1 1s1-.45 1-1zm0 17v-3c0-.55-.45-1-1-1s-1 .45-1 1v3c0 .55.45 1 1 1s1-.45 1-1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l2.12 2.12c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41L5.99 4.58zm12.42 12.42c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l2.12 2.12c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-2.12-2.12zM3 13H0c-.55 0-1-.45-1-1s.45-1 1-1h3c.55 0 1 .45 1 1s-.45 1-1 1zm18-2h3c.55 0 1 .45 1 1s-.45 1-1 1h-3c-.55 0 1-.45 1-1s.45-1 1-1zM4.58 18.01l2.12-2.12c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-2.12 2.12c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0zm14.84-14.84l-2.12 2.12c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l2.12-2.12c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0z" />
      </svg>
      <img v-else :src="baseUrl + 'img/moon.svg'" alt="Switch to dark mode" />
    </button>
  </div>
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
    // Set Lumia purple as primary color
    this.setLumiaColors();
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
    setLumiaColors() {
      // Set Lumia purple as the primary color
      const lumiaPurple = '#9c6ade';
      document.documentElement.style.setProperty('--color-primary', lumiaPurple);
      document.documentElement.style.setProperty('--color-button-background', lumiaPurple);
      
      // Set RGB version
      const rgb = this.hexToRgb(lumiaPurple);
      if (rgb) {
        document.documentElement.style.setProperty('--color-primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
      }
      
      // Remove any saved color preference
      localStorage.removeItem('themeColor');
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
    },
    hexToRgb(hex) {
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
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

.theme-toggle-container {
  position: relative;
  display: inline-flex;
  align-items: center;
}

/* Color the sun icon yellow in dark mode by filling its path */
[data-theme="dark"] .theme-toggle svg.sun-icon path {
  fill: var(--color-warning) !important;
}
</style> 