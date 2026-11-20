<script setup>
import { maxCartQuantity, useCart } from '../composables/useCart.js'
import { artworkUrl, formatPrice } from '../lib/catalog.js'

const { items, count, total, setQuantity, remove } = useCart()

function onQuantityChange(event, item) {
  const input = event.currentTarget
  if (!setQuantity(item.slug, input.valueAsNumber)) {
    input.value = item.quantity
  }
}
</script>

<template>
  <div class="container cart-page">
    <nav class="breadcrumbs" aria-label="Навигация по магазину">
      <RouterLink to="/shop">Каталог</RouterLink>
      <span aria-hidden="true">/</span>
      <span aria-current="page">Корзина</span>
    </nav>
    <h1>Корзина</h1>

    <section v-if="!items.length" class="status-panel cart-empty">
      <h2>Корзина пока пуста</h2>
      <RouterLink class="button button-primary" to="/shop">Открыть каталог</RouterLink>
    </section>

    <div v-else class="cart-layout">
      <ul class="cart-list" aria-label="Плагины в корзине">
        <li v-for="item in items" :key="item.slug" class="cart-item">
          <div class="cart-product">
            <img :src="artworkUrl(item.artwork)" width="104" height="78" alt="">
            <div class="cart-info">
              <RouterLink :to="`/shop/${item.slug}`">{{ item.name }}</RouterLink>
              <p>Minecraft {{ item.version }}</p>
              <p>{{ formatPrice(item.price) }} / шт.</p>
            </div>
          </div>

          <div class="quantity">
            <button
              type="button"
              :aria-label="`Уменьшить количество ${item.name}`"
              :disabled="item.quantity <= 1"
              @click="setQuantity(item.slug, item.quantity - 1)"
            >−</button>
            <input
              type="number"
              inputmode="numeric"
              min="1"
              :max="maxCartQuantity"
              step="1"
              :value="item.quantity"
              :aria-label="`Количество ${item.name}`"
              @change="onQuantityChange($event, item)"
              @keydown.enter="$event.target.blur()"
            >
            <button
              type="button"
              :aria-label="`Увеличить количество ${item.name}`"
              :disabled="item.quantity >= maxCartQuantity"
              @click="setQuantity(item.slug, item.quantity + 1)"
            >+</button>
          </div>

          <div class="cart-amount">
            <strong>{{ formatPrice(item.price * item.quantity) }}</strong>
            <button type="button" :aria-label="`Удалить ${item.name}`" @click="remove(item.slug)">
              Удалить
            </button>
          </div>
        </li>
      </ul>

      <aside class="cart-total" aria-labelledby="total-heading">
        <h2 id="total-heading">Сумма заказа</h2>
        <dl>
          <div>
            <dt>Количество</dt>
            <dd>{{ count }} шт.</dd>
          </div>
          <div class="cart-total-amount">
            <dt>Итого</dt>
            <dd aria-live="polite">{{ formatPrice(total) }}</dd>
          </div>
        </dl>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.cart-page {
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

.breadcrumbs a {
  color: var(--accent);
}

.cart-page h1 {
  margin: 0 0 1.65rem;
  font-size: clamp(2rem, 5vw, 3.25rem);
  line-height: 1.08;
  letter-spacing: -.04em;
}

.cart-empty {
  min-height: 16rem;
}

.cart-empty .button {
  margin-top: .75rem;
}

.cart-layout {
  display: grid;
  grid-template-columns: minmax(0, 2.3fr) minmax(14rem, 1fr);
  align-items: start;
  gap: 1.5rem;
}

.cart-list {
  display: grid;
  gap: .75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.cart-item, .cart-total {
  padding: clamp(.85rem, 2vw, 1.35rem);
  border: 1px solid var(--stroke);
  border-radius: 1rem;
  background: var(--surface);
}

.cart-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(5.3rem, auto);
  grid-template-areas: 'product quantity amount';
  align-items: center;
  gap: .75rem 1.3rem;
}

.cart-product {
  grid-area: product;
  display: flex;
  align-items: center;
  gap: .8rem;
  min-width: 0;
}

.cart-product img {
  flex: none;
  width: clamp(4.25rem, 8vw, 6.5rem);
  height: auto;
  aspect-ratio: 4 / 3;
  border-radius: .45rem;
  object-fit: cover;
  background: var(--surface-raised);
}

.cart-info a {
  display: block;
  margin-bottom: .25rem;
  overflow-wrap: anywhere;
  font-weight: 700;
}

.cart-info a:hover {
  color: var(--accent);
}

.cart-info p {
  margin: 0;
  color: var(--muted);
  font-size: .875rem;
  line-height: 1.45;
}

.quantity {
  display: grid;
  grid-area: quantity;
  grid-template-columns: repeat(3, 2.5rem);
  width: max-content;
  overflow: hidden;
  border: 1px solid var(--stroke);
  border-radius: .55rem;
  background: var(--surface-raised);
}

.quantity:focus-within {
  border-color: var(--accent);
}

.quantity button, .quantity input {
  min-width: 0;
  min-height: 2.625rem;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--text);
  font: inherit;
  text-align: center;
}

.quantity button {
  cursor: pointer;
  font-size: 1.15rem;
}

.quantity button:focus-visible, .quantity input:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: -3px;
}

.quantity button:hover:not(:disabled) {
  color: var(--accent);
}

.quantity button:disabled {
  opacity: .4;
  cursor: default;
}

.quantity input {
  appearance: textfield;
  border-inline: 1px solid var(--stroke);
  font-variant-numeric: tabular-nums;
}

.quantity input::-webkit-inner-spin-button,
.quantity input::-webkit-outer-spin-button {
  margin: 0;
  appearance: none;
}

.cart-amount {
  grid-area: amount;
  display: grid;
  justify-items: end;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.cart-amount button {
  min-height: 2rem;
  padding: 0;
  border: 0;
  background: none;
  color: var(--muted);
  font: inherit;
  font-size: .875rem;
  cursor: pointer;
}

.cart-amount button:hover {
  color: var(--danger, #fda4af);
}

.cart-total h2 {
  margin: 0 0 1.2rem;
  font-size: 1.2rem;
}

.cart-total dl, .cart-total dd {
  margin: 0;
}

.cart-total dl div {
  display: flex;
  justify-content: space-between;
  gap: .5rem;
  color: var(--muted);
}

.cart-total .cart-total-amount {
  align-items: baseline;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--stroke);
  color: var(--text);
  font-weight: 700;
}

.cart-total dd {
  text-align: right;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.cart-total-amount dd {
  font-size: 1.5rem;
}

@media (max-width: 880px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .cart-page h1 {
    margin-bottom: 1.25rem;
  }

  .cart-item {
    grid-template-columns: 1fr auto;
    grid-template-areas: 'product product' 'quantity amount';
  }

  .cart-layout {
    gap: 1rem;
  }
}
</style>
