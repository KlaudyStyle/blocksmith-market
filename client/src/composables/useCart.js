import { computed, readonly, ref } from 'vue'

const storageKey = 'blocksmith-market:cart:v1'
export const maxCartQuantity = 99

function isCartProduct(product) {
  return Boolean(
    product &&
    typeof product.slug === 'string' &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.slug) &&
    typeof product.name === 'string' &&
    product.name.trim() &&
    Number.isSafeInteger(product.price) &&
    product.price >= 0 &&
    typeof product.version === 'string' &&
    typeof product.artwork === 'string',
  )
}

function isQuantity(quantity) {
  return Number.isInteger(quantity) && quantity >= 1 && quantity <= maxCartQuantity
}

function cartItem({ slug, name, price, version, artwork }, quantity) {
  return { slug, name, price, version, artwork, quantity }
}

function readItems() {
  try {
    const stored = JSON.parse(globalThis.localStorage.getItem(storageKey) ?? '[]')
    if (!Array.isArray(stored)) return []

    const validItems = new Map()
    for (const item of stored) {
      if (isCartProduct(item) && isQuantity(item.quantity)) {
        validItems.set(item.slug, cartItem(item, item.quantity))
      }
    }
    return [...validItems.values()]
  } catch {
    return []
  }
}

const items = ref(readItems())
const count = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))
const total = computed(() => items.value.reduce((sum, item) => sum + item.price * item.quantity, 0))

function save(nextItems) {
  items.value = nextItems
  try {
    globalThis.localStorage.setItem(storageKey, JSON.stringify(nextItems))
  } catch {
    return
  }
}

function add(product) {
  if (!isCartProduct(product)) return false

  const existing = items.value.find((item) => item.slug === product.slug)
  const quantity = (existing?.quantity ?? 0) + 1
  if (!isQuantity(quantity)) return false

  const nextItem = cartItem(product, quantity)
  const nextItems = existing
    ? items.value.map((item) => item.slug === product.slug ? nextItem : item)
    : [...items.value, nextItem]
  save(nextItems)
  return true
}

function setQuantity(slug, quantity) {
  if (!isQuantity(quantity)) return false

  const existing = items.value.find((item) => item.slug === slug)
  if (!existing) return false
  if (existing.quantity === quantity) return true

  save(items.value.map((item) => item.slug === slug ? { ...item, quantity } : item))
  return true
}

function remove(slug) {
  save(items.value.filter((item) => item.slug !== slug))
}

export function useCart() {
  return { items: readonly(items), count, total, add, setQuantity, remove }
}
