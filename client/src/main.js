import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import CatalogView from './views/CatalogView.vue';
import './style.css';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/shop' },
    { path: '/shop', name: 'catalog', component: CatalogView },
    { path: '/shop/:slug', name: 'product', component: () => import('./views/ProductView.vue') },
    { path: '/cart', name: 'cart', component: () => import('./views/CartView.vue') },
    { path: '/:pathMatch(.*)*', component: () => import('./views/NotFoundView.vue') },
  ],
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0 };
  },
});

createApp(App).use(router).mount('#app');
