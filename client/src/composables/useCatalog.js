import { onScopeDispose, ref, watch } from 'vue';
import { getProducts } from '../api/products.js';

const pageSize = 6;
const searchDelay = 320;

export function useCatalog() {
  const search = ref('');
  const category = ref('');
  const sort = ref('');
  const items = ref([]);
  const total = ref(0);
  const hasMore = ref(false);
  const loading = ref(true);
  const loadingMore = ref(false);
  const error = ref('');
  let page = 0;
  let pending;
  let timer;

  async function load(nextPage) {
    pending?.abort();
    const controller = new AbortController();
    pending = controller;
    const append = nextPage > 1;
    loading.value = !append;
    loadingMore.value = append;
    error.value = '';

    try {
      const data = await getProducts({
        search: search.value.trim(),
        category: category.value,
        sort: sort.value,
        page: nextPage,
        limit: pageSize,
      }, { signal: controller.signal });
      if (controller.signal.aborted) return;

      items.value = append ? [...items.value, ...data.items] : data.items;
      total.value = data.total;
      hasMore.value = data.hasMore;
      page = nextPage;
    } catch {
      if (!controller.signal.aborted) error.value = 'Не удалось загрузить плагины.';
    } finally {
      if (pending === controller) {
        pending = undefined;
        loading.value = false;
        loadingMore.value = false;
      }
    }
  }

  watch([search, category, sort], ([nextSearch, nextCategory, nextSort], previous) => {
    clearTimeout(timer);
    pending?.abort();
    pending = undefined;
    page = 0;
    items.value = [];
    total.value = 0;
    loading.value = true;
    loadingMore.value = false;
    error.value = '';
    hasMore.value = false;

    const searchOnly = previous.length > 0
      && nextSearch !== previous[0]
      && nextCategory === previous[1]
      && nextSort === previous[2];

    if (searchOnly) {
      timer = setTimeout(() => load(1), searchDelay);
    } else {
      load(1);
    }
  }, { immediate: true });

  function reset() {
    search.value = '';
    category.value = '';
    sort.value = '';
  }

  function loadMore() {
    if (hasMore.value && !loadingMore.value) load(page + 1);
  }

  function retry() {
    load(page + 1);
  }

  onScopeDispose(() => {
    clearTimeout(timer);
    pending?.abort();
  });

  return { search, category, sort, items, total, hasMore, loading, loadingMore, error, reset, loadMore, retry };
}
