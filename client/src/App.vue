<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router';
import AppIcon from './components/AppIcon.vue';
import { useCart } from './composables/useCart.js';

const { count } = useCart();
const route = useRoute();
</script>

<template>
  <a class="skip-link" href="#main">К содержимому</a>
  <header class="site-header">
    <div class="container header-inner">
      <RouterLink to="/shop" class="brand" aria-label="Blocksmith Market — каталог">
        <span class="brand-mark"><AppIcon name="cube" :size="22" /></span>
        <span>Blocksmith<span class="brand-end"> Market</span></span>
      </RouterLink>
      <nav aria-label="Главная навигация" class="header-nav">
        <RouterLink
          to="/shop"
          class="nav-link"
          :class="{ 'is-active': route.name === 'catalog' || route.name === 'product' }"
        >
          Каталог
        </RouterLink>
        <RouterLink to="/cart" class="cart-link" :aria-label="`Корзина, товаров: ${count}`">
          <AppIcon name="cart" :size="19" />
          <span class="cart-label">Корзина</span>
          <span class="cart-count">{{ count }}</span>
        </RouterLink>
      </nav>
    </div>
  </header>

  <main id="main" class="site-main" tabindex="-1">
    <RouterView />
  </main>

  <footer class="site-footer">
    <div class="container footer-inner">
      <span class="footer-brand"><AppIcon name="cube" :size="16" /> Blocksmith Market</span>
      <span>Плагины для серверов Minecraft</span>
    </div>
  </footer>
</template>
