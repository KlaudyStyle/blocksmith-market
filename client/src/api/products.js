async function request(path, signal) {
  const response = await fetch(path, { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const error = new Error(body?.message ?? 'Ошибка запроса.');
    error.status = response.status;
    throw error;
  }
  return response.json();
}

export function getProducts({ search, category, sort, page, limit }, { signal } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.set('search', search);
  if (category) params.set('category', category);
  if (sort) params.set('sort', sort);
  return request(`/api/products?${params}`, signal);
}

export function getProduct(slug, { signal } = {}) {
  return request(`/api/products/${encodeURIComponent(slug)}`, signal);
}
