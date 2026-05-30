/**
 * Post Category Select Component
 * 
 * @component
 * @version 1.0.0
 * @author Gikonyo Mwema
 */

import { Select } from 'flowbite-react';

const categories = [
  { value: 'uncategorized', label: '🌍 Select a category' },
  { value: 'climate-change', label: '🔥 Climate Change' },
  { value: 'renewable-energy', label: '☀️ Renewable Energy' },
  { value: 'sustainable-agriculture', label: '🌱 Sustainable Agriculture' },
  { value: 'conservation', label: '🐘 Wildlife Conservation' },
  { value: 'zero-waste', label: '♻️ Zero Waste' },
  { value: 'ocean-preservation', label: '🌊 Ocean Health' },
  { value: 'green-tech', label: '💡 Green Tech' },
  { value: 'environmental-policy', label: '📜 Eco Policy' },
  { value: 'sustainable-cities', label: '🏙️ Sustainable Cities' },
  { value: 'eco-tourism', label: '✈️ Responsible Travel' },
  // New cross-cutting categories
  { value: 'politics', label: '🏛️ Politics' },
  { value: 'history', label: '📚 History' },
  { value: 'governance', label: '🧭 Governance' },
  { value: 'regulation', label: '⚖️ Regulation' },
  { value: 'environmental-law', label: '⚖️ Environmental Law' },
  { value: 'public-health', label: '🏥 Public Health' },
  { value: 'climate-justice', label: '⚖️ Climate Justice' },
  { value: 'biodiversity', label: '🦋 Biodiversity' },
  { value: 'water-resources', label: '💧 Water Resources' },
  { value: 'energy-policy', label: '🔌 Energy Policy' },
  { value: 'environmental-economics', label: '📈 Environmental Economics' },
  { value: 'urban-planning', label: '🏗️ Urban Planning' },
  { value: 'indigenous-knowledge', label: '🪶 Indigenous Knowledge' }
];

export default function PostCategorySelect({ value, onChange }) {
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="min-w-[200px]"
    >
      {categories.map((cat) => (
        <option key={cat.value} value={cat.value}>
          {cat.label}
        </option>
      ))}
    </Select>
  );
}