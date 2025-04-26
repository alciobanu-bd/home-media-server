import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './styles/theme.css';

// Apply theme from localStorage before mounting the app
const applyThemeFromStorage = () => {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
};

// Apply theme before mounting the app to prevent flash of wrong theme
applyThemeFromStorage();

createApp(App)
  .use(router)
  .mount('#app'); 