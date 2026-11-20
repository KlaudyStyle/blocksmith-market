import { readFileSync } from 'node:fs';

const products = JSON.parse(readFileSync(new URL('./data/products.json', import.meta.url), 'utf8'));
const productsBySlug = new Map(products.map((product) => [product.slug, product]));
const categories = new Set(['tools', 'gameplay', 'moderation', 'world']);
const sortOptions = new Set(['default', 'price-asc', 'price-desc']);
const allowedParameters = new Set(['search', 'category', 'sort', 'page', 'limit']);

export class InvalidProductQuery extends Error {}

function positiveInteger(raw, name, max = Number.MAX_SAFE_INTEGER) {
  const value = Number(raw);
  if (!/^[1-9]\d*$/.test(raw) || !Number.isSafeInteger(value) || value > max) {
    throw new InvalidProductQuery(`Параметр ${name} должен быть целым числом от 1 до ${max}.`);
  }
  return value;
}

function parseQuery(query) {
  try {
    decodeURIComponent(query);
  } catch (error) {
    if (error instanceof URIError) {
      throw new InvalidProductQuery('Некорректная кодировка параметров запроса.');
    }
    throw error;
  }

  const parameters = new URLSearchParams(query);
  const seen = new Set();
  for (const key of parameters.keys()) {
    if (!allowedParameters.has(key) || seen.has(key)) {
      throw new InvalidProductQuery('Запрос содержит неизвестный или повторяющийся параметр.');
    }
    seen.add(key);
  }

  const rawSearch = parameters.get('search') ?? '';
  if (rawSearch.length > 100 || /[\u0000-\u001f\u007f]/.test(rawSearch)) {
    throw new InvalidProductQuery('Поисковый запрос должен содержать не более 100 символов и не может включать управляющие символы.');
  }

  const category = parameters.get('category');
  if (category !== null && !categories.has(category)) {
    throw new InvalidProductQuery('Неизвестная категория.');
  }

  const sort = parameters.get('sort') ?? 'default';
  if (!sortOptions.has(sort)) {
    throw new InvalidProductQuery('Неизвестная сортировка.');
  }

  return {
    search: rawSearch.trim().toLowerCase(),
    category,
    sort,
    page: positiveInteger(parameters.get('page') ?? '1', 'page'),
    limit: positiveInteger(parameters.get('limit') ?? '6', 'limit', 50),
  };
}

export function listProducts(query) {
  const { search, category, sort, page, limit } = parseQuery(query);
  const matching = products.filter((product) => {
    return (!category || product.category === category) && product.name.toLowerCase().includes(search);
  });

  if (sort === 'price-asc') matching.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') matching.sort((a, b) => b.price - a.price);

  const total = matching.length;
  if (page > Math.ceil(total / limit)) return { items: [], total, hasMore: false };

  const start = (page - 1) * limit;
  return { items: matching.slice(start, start + limit), total, hasMore: start + limit < total };
}

export function getProduct(slug) {
  return productsBySlug.get(slug);
}
