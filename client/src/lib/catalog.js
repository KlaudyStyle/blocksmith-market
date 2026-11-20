export const categoryLabels = {
  tools: 'Инструменты',
  gameplay: 'Геймплей',
  moderation: 'Модерация',
  world: 'Мир',
};

const rubles = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

export function formatPrice(price) {
  return rubles.format(price);
}

export function artworkUrl(artwork) {
  return `/art/${artwork}.jpg`;
}

const pluginCount = new Intl.PluralRules('ru-RU');
const pluginForms = { one: 'плагин', few: 'плагина', many: 'плагинов', other: 'плагина' };

export function formatPluginCount(count) {
  return `${count} ${pluginForms[pluginCount.select(count)]}`;
}
