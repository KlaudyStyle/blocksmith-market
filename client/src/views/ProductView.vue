<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getProduct } from '../api/products.js'
import { maxCartQuantity, useCart } from '../composables/useCart.js'
import { artworkUrl, categoryLabels, formatPrice } from '../lib/catalog.js'

const route = useRoute()
const { items, add } = useCart()
const product = ref(null)
const pending = ref(true)
const errorStatus = ref(null)
const attempt = ref(0)
const cartQuantity = computed(() =>
  items.value.find((item) => item.slug === product.value?.slug)?.quantity ?? 0,
)

watch([() => route.params.slug, attempt], async ([slug], _oldValue, onCleanup) => {
  const controller = new AbortController()
  onCleanup(() => controller.abort())

  product.value = null
  errorStatus.value = null
  pending.value = true

  try {
    const result = await getProduct(slug, { signal: controller.signal })
    if (!controller.signal.aborted) product.value = result
  } catch (error) {
    if (!controller.signal.aborted) errorStatus.value = error?.status ?? 0
  } finally {
    if (!controller.signal.aborted) pending.value = false
  }
}, { immediate: true })
</script>

<template>
  <div class="container product-page" :aria-busy="pending">
    <nav class="breadcrumbs" aria-label="Навигация по каталогу">
      <RouterLink to="/shop">Каталог</RouterLink>
      <template v-if="product">
        <span aria-hidden="true">/</span>
        <span aria-current="page">{{ product.name }}</span>
      </template>
    </nav>

    <section v-if="pending" class="status-panel product-status" role="status">
      <p>Загружаем плагин…</p>
    </section>

    <section v-else-if="errorStatus === 404" class="status-panel product-status">
      <h1>Плагин не найден</h1>
      <RouterLink class="button button-primary" to="/shop">Открыть каталог</RouterLink>
    </section>

    <section v-else-if="errorStatus !== null" class="status-panel product-status">
      <h1>Не удалось загрузить плагин</h1>
      <button class="button button-primary" type="button" @click="attempt++">Повторить</button>
    </section>

    <template v-else-if="product">
      <div class="product-layout">
        <figure class="gallery">
          <img :src="artworkUrl(product.artwork)" alt="" width="720" height="450">
          <figcaption>Галерея · пока без скриншотов</figcaption>
        </figure>

        <section class="product-summary" aria-labelledby="product-name">
          <div class="product-tags">
            <span>{{ categoryLabels[product.category] }}</span>
            <span>Minecraft {{ product.version }}</span>
          </div>
          <h1 id="product-name">{{ product.name }}</h1>
          <p class="summary">{{ product.summary }}</p>

          <div class="purchase">
            <strong>{{ formatPrice(product.price) }}</strong>
            <button
              class="button button-primary"
              type="button"
              :disabled="cartQuantity >= maxCartQuantity"
              @click="add(product)"
            >
              В корзину
            </button>
          </div>
          <p class="purchase-feedback" role="status">
            <template v-if="cartQuantity">
              <RouterLink to="/cart">В корзине</RouterLink> {{ cartQuantity }} шт.
            </template>
          </p>
        </section>
      </div>

      <section class="description" aria-labelledby="product-description">
        <h2 id="product-description">Описание</h2>
        <p>{{ product.description }}</p>
        <ul v-if="product.features?.length">
          <li v-for="feature in product.features" :key="feature">{{ feature }}</li>
        </ul>
      </section>
    </template>
  </div>
</template>

<style scoped>
.product-page {
  padding-block: 2rem 4rem;
}

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: .6rem;
  margin-bottom: 1.5rem;
  color: var(--muted);
  font-size: .9rem;
}

.breadcrumbs a, .purchase-feedback a {
  color: var(--accent);
}

.product-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
  gap: 1.5rem;
}

.gallery, .product-summary, .description {
  min-width: 0;
  margin: 0;
  border: 1px solid var(--stroke);
  border-radius: 1rem;
  background: var(--surface);
}

.gallery {
  overflow: hidden;
  align-self: start;
}

.gallery img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  background: var(--surface-raised);
}

.gallery figcaption {
  padding: .85rem 1rem;
  color: var(--muted);
  font-size: .875rem;
}

.product-summary, .description {
  padding: clamp(1.15rem, 3vw, 2rem);
}

.product-summary {
  display: flex;
  flex-direction: column;
}

.product-tags {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
}

.product-tags span {
  padding: .35rem .6rem;
  border: 1px solid var(--stroke);
  border-radius: .45rem;
  background: var(--surface-raised);
  color: var(--muted);
  font-size: .875rem;
}

.product-summary h1 {
  margin: .9rem 0 .55rem;
  overflow-wrap: anywhere;
  font-size: clamp(2rem, 5vw, 3.25rem);
  line-height: 1.08;
  letter-spacing: -.04em;
}

.summary, .description p, .description li {
  margin: 0;
  color: var(--muted);
  line-height: 1.65;
}

.purchase {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: .85rem 1.25rem;
  margin-top: auto;
  padding-top: 2rem;
}

.purchase strong {
  font-size: 1.65rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.purchase-feedback {
  min-height: 1.4em;
  margin: .75rem 0 0;
  color: var(--muted);
  font-size: .9rem;
}

.description {
  margin-top: 1.5rem;
}

.description h2 {
  margin: 0 0 .65rem;
  font-size: 1.3rem;
}

.description p {
  max-width: 70ch;
  white-space: pre-line;
}

.description ul {
  margin: .85rem 0 0;
  padding-left: 1.25rem;
}

.description li::marker {
  color: var(--accent);
}

.product-status {
  min-height: 14rem;
}

.product-status .button {
  margin-top: .75rem;
}

@media (max-width: 760px) {
  .product-layout {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .description {
    margin-top: 1rem;
  }
}
</style>
