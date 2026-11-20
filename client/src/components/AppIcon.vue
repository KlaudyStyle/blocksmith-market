<script setup>
defineProps({
  name: { type: String, required: true },
  size: { type: Number, default: 20 },
});

const paths = {
  cube: 'M12 2.5 21 7.5v9l-9 5-9-5v-9l9-5Zm0 9 9-4m-9 4-9-4m9 4v10',
  cart: 'M2.5 3.5h2L7 15h12l2-8.5H5.1M9 20h.01m8.49 0h.01',
  search: 'M21 21l-4.2-4.2m2.2-5.3a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z',
  chevron: 'm6 9 6 6 6-6',
  sort: 'M4 6h16M4 12h10M4 18h5',
  grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  close: 'm6 6 12 12M18 6 6 18',
  alert: 'M12 8v5m0 3h.01M10.3 4.7 3 17.3A1.8 1.8 0 0 0 4.6 20h14.8a1.8 1.8 0 0 0 1.6-2.7L13.7 4.7a2 2 0 0 0-3.4 0Z',
};
</script>

<template>
  <svg
    aria-hidden="true"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.65"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path :d="paths[name]" />
  </svg>
</template>
