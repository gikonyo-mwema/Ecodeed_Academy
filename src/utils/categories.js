// Category utilities: mapping, normalization, and label formatting

// Tailwind classes for category badges in light/dark modes
export const categoryColors = {
  'climate-change': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  'renewable-energy': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'sustainable-agriculture': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'conservation': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  'zero-waste': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  'ocean-preservation': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  'green-tech': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'environmental-policy': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  'sustainable-cities': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  'eco-tourism': 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200',
  // Newly added cross-cutting categories
  'politics': 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
  'history': 'bg-stone-100 text-stone-800 dark:bg-stone-900 dark:text-stone-200',
  'governance': 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-200',
  'regulation': 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
  'environmental-law': 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200',
  'public-health': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  'climate-justice': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'biodiversity': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'water-resources': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  'energy-policy': 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
  'environmental-economics': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  'urban-planning': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'indigenous-knowledge': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  default: 'bg-brand-yellow text-brand-blue dark:bg-brand-blue dark:text-brand-yellow'
};

// Normalize a category value to a slug key used by the map
export function getCategoryKey(value) {
  if (!value) return 'uncategorized';
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '-');
}

// Return the Tailwind class for a category, with a sensible default
export function getCategoryColorClass(value) {
  const key = getCategoryKey(value);
  return categoryColors[key] || categoryColors.default;
}

// Format a category slug into Title Case for display
export function formatCategoryLabel(value) {
  const key = getCategoryKey(value);
  return key
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
