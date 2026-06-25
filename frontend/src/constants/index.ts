export const API_BASE = import.meta.env['VITE_API_URL'] ?? 'http://localhost:3001';

export const RISK_COLORS: Record<string, string> = {
  'On Track': '#16a34a',
  'Behind': '#ca8a04',
  'At Risk': '#ea580c',
  'Critical': '#dc2626',
};

export const RISK_BG_CLASSES: Record<string, string> = {
  'On Track': 'bg-green-100 text-green-800',
  'Behind': 'bg-yellow-100 text-yellow-800',
  'At Risk': 'bg-orange-100 text-orange-800',
  'Critical': 'bg-red-100 text-red-800',
};

export const MONTHS = ['July 2025', 'August 2025', 'September 2025'];

export const MEDIA_TYPE_ICONS: Record<string, string> = {
  Photo: '📷',
  Video: '🎬',
  Document: '📄',
};
