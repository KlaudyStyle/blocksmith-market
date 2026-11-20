<script setup>
import { RouterLink } from 'vue-router';
import { artworkUrl, categoryLabels, formatPrice } from '../lib/catalog.js';

defineProps({ product: { type: Object, required: true } });
</script>

<template>
  <article class="product-card">
    <RouterLink :to="{ name: 'product', params: { slug: product.slug } }" class="product-link">
      <div class="card-art">
        <img :src="artworkUrl(product.artwork)" alt="" width="480" height="245" />
        <span class="version-tag">MC {{ product.version }}</span>
      </div>
      <div class="card-body">
        <span class="card-category">{{ categoryLabels[product.category] }}</span>
        <h3>{{ product.name }}</h3>
        <p>{{ product.summary }}</p>
        <div class="card-bottom">
          <strong>{{ formatPrice(product.price) }}</strong>
          <span class="card-detail">Подробнее</span>
        </div>
      </div>
    </RouterLink>
  </article>
</template>
