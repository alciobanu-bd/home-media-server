import { createRouter, createWebHistory } from 'vue-router';
import Gallery from '../views/Gallery.vue';
import ViewMedia from '../views/ViewMedia.vue';
import Login from '../views/Login.vue';
import Albums from '../views/Albums.vue';
import AlbumView from '../views/AlbumView.vue';
import About from '../views/About.vue';
import authStore from '../store/authStore';

const routes = [
  {
    path: '/',
    name: 'Gallery',
    component: Gallery,
    meta: { requiresAuth: true }
  },
  {
    path: '/view/:id',
    name: 'ViewMedia',
    component: ViewMedia,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/albums',
    name: 'Albums',
    component: Albums,
    meta: { requiresAuth: true }
  },
  {
    path: '/albums/:id',
    name: 'AlbumView',
    component: AlbumView,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    // About page can be viewed by anyone
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guest: true }
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

// Track whether authentication has been checked at least once
let authChecked = false;

// Navigation guard
router.beforeEach(async (to, from, next) => {
  // Only check auth if it hasn't been checked yet or user is null
  if (!authChecked || !authStore.state.user) {
    // Set loading state to prevent premature navigation
    if (!authStore.state.isLoading) {
      await authStore.checkAuth();
    } else {
      // Wait for any in-progress auth check to complete
      await new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (!authStore.state.isLoading) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      });
    }
    authChecked = true;
  }
  
  // After auth check, handle route guards
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authStore.state.isAuthenticated) {
      next({ name: 'Login' });
    } else {
      next();
    }
  } 
  // Handle guest routes (like login)
  else if (to.matched.some(record => record.meta.guest)) {
    if (authStore.state.isAuthenticated) {
      next({ name: 'Gallery' });
    } else {
      next();
    }
  } else {
    // Routes without meta tags
    next();
  }
});

export default router; 