<script setup>
import AppIcon from '../components/AppIcon.vue';
import ProductCard from '../components/ProductCard.vue';
import { useCatalog } from '../composables/useCatalog.js';
import { categoryLabels, formatPluginCount } from '../lib/catalog.js';

const { search, category, sort, items, total, hasMore, loading, loadingMore, error, reset, loadMore, retry } = useCatalog();
</script>

<template>
  <div class="container catalog">
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-copy">
        <h1 id="hero-title">Плагины для<br />серверов <span>Minecraft</span></h1>
        <p>Инструменты для администраторов, защита мира и новые механики для игроков.</p>
      </div>
    </section>

    <section class="catalog-section" aria-labelledby="catalog-title">
      <div class="section-heading">
        <h2 id="catalog-title">Каталог плагинов</h2>
        <span v-if="!loading && (!error || items.length)" class="result-count" role="status">
          {{ formatPluginCount(total) }}
        </span>
      </div>
      <form class="catalog-controls" role="search" @submit.prevent>
        <div class="search-field">
          <AppIcon name="search" :size="19" />
          <input
            v-model="search"
            type="search"
            aria-label="Поиск по названию"
            placeholder="Поиск по названию"
            maxlength="100"
          />
          <button v-if="search" type="button" class="search-clear" aria-label="Очистить поиск" @click="search = ''">
            <AppIcon name="close" :size="17" />
          </button>
        </div>
        <label class="select-field">
          <AppIcon name="grid" :size="17" />
          <select v-model="category" aria-label="Категория">
            <option value="">Все категории</option>
            <option v-for="(name, id) in categoryLabels" :key="id" :value="id">{{ name }}</option>
          </select>
          <AppIcon name="chevron" :size="16" class="select-chevron" />
        </label>
        <label class="select-field">
          <AppIcon name="sort" :size="19" />
          <select v-model="sort" aria-label="Сортировка">
            <option value="">По умолчанию</option>
            <option value="price-asc">Сначала дешевле</option>
            <option value="price-desc">Сначала дороже</option>
          </select>
          <AppIcon name="chevron" :size="16" class="select-chevron" />
        </label>
      </form>

      <div :aria-busy="loading || loadingMore">
        <div v-if="loading" class="product-grid" aria-hidden="true">
          <div v-for="index in 6" :key="index" class="skeleton-card">
            <div class="skeleton-art"></div>
            <div class="skeleton-body"><span></span><span></span><span></span></div>
          </div>
        </div>
        <template v-else>
          <div v-if="items.length && (!error || hasMore)" class="product-grid">
            <ProductCard v-for="product in items" :key="product.slug" :product="product" />
          </div>
          <div v-if="error" class="status-panel" role="alert">
            <AppIcon name="alert" :size="28" />
            <h3>{{ error }}</h3>
            <button type="button" class="button" @click="retry">Повторить</button>
          </div>
          <div v-else-if="!items.length" class="status-panel">
            <AppIcon name="search" :size="28" />
            <h3>Плагины не найдены</h3>
            <p>Попробуйте изменить запрос или выбрать другую категорию.</p>
            <button type="button" class="button" @click="reset">Сбросить фильтры</button>
          </div>
          <div v-if="hasMore && !error" class="more-row">
            <button type="button" class="button" :disabled="loadingMore" @click="loadMore">
              {{ loadingMore ? 'Загрузка…' : 'Показать ещё' }}
              <AppIcon v-if="!loadingMore" name="chevron" :size="17" />
            </button>
          </div>
        </template>
      </div>
      <span v-if="loading || loadingMore" class="sr-only" role="status">Загрузка плагинов</span>
    </section>
  </div>
</template>
