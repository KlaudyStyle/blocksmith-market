<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
  <div class="container route-page">
    <section class="status-panel">
      <h1>Страница не найдена</h1>
      <RouterLink to="/shop" class="button button-primary">В каталог</RouterLink>
    </section>
  </div>
</template>
