import { createRouter, createWebHistory } from 'vue-router';
import Gallery from '../views/Gallery.vue';
import ViewMedia from '../views/ViewMedia.vue';

const routes = [
  {
    path: '/',
    name: 'Gallery',
    component: Gallery
  },
  {
    path: '/view/:id',
    name: 'ViewMedia',
    component: ViewMedia,
    props: true
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router; 