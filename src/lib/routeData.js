import worldCountries from 'world-countries';
import visaDb from '../../netlify/functions/visa-requirements.json';
import waiversDb from '../../netlify/functions/visa-waivers.json';
import countries from '../data/countries';

const DEMONYMS = new Map(
  worldCountries.map((c) => [c.cca2, c.demonyms?.eng?.f || null])
);

export function getDemonym(code) {
  return DEMONYMS.get(code) || null;
}

// "Indian citizens" when a demonym exists, "citizens of India" otherwise
export function citizensOf(code, name) {
  const demonym = getDemonym(code);
  return demonym ? `${demonym} citizens` : `citizens of ${name}`;
}

export const ORIGINS = [
  'IN', 'CN', 'PH', 'ID', 'VN', 'TH', 'PK', 'BD', 'LK', 'NP',
  'NG', 'GH', 'KE', 'ZA', 'EG', 'MA', 'TR', 'RU', 'UA', 'BR',
  'MX', 'CO', 'AR', 'PE', 'US', 'CA', 'GB', 'IE', 'AU', 'NZ',
  'DE', 'FR', 'ES', 'IT', 'NL', 'PL', 'PT', 'RO', 'JP', 'KR',
];

export const DESTINATIONS = [
  'US', 'GB', 'CA', 'AU', 'NZ', 'DE', 'FR', 'ES', 'IT', 'NL',
  'PT', 'GR', 'CH', 'AT', 'IE', 'JP', 'KR', 'SG', 'MY', 'TH',
  'ID', 'VN', 'AE', 'SA', 'QA', 'TR', 'EG', 'MA', 'ZA', 'KE',
  'BR', 'MX', 'AR', 'CN', 'IN', 'RU', 'PL', 'CZ', 'HR', 'IS',
];

// Freedom-of-movement carve-outs — mirrors netlify/functions/visa-lookup.mjs
const EU_EEA_CH = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
  'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
  'SI', 'ES', 'SE', 'IS', 'LI', 'NO', 'CH',
];

export const CATEGORY_LABELS = {
  visa_free: 'No visa required',
  eta: 'eTA required',
  e_visa: 'e-Visa required',
  visa_on_arrival: 'Visa on arrival',
  visa_required: 'Visa required',
  no_admission: 'Entry not permitted',
  unknown: 'Check requirements',
};

const REQUIREMENT_DESCRIPTIONS = {
  visa_free: 'No visa required for short-term stays.',
  visa_on_arrival: 'A visa can be obtained on arrival at the destination.',
  eta: 'An Electronic Travel Authorization (eTA) is required before travel.',
  e_visa: 'An e-Visa must be obtained online before travel.',
  visa_required: 'A visa must be obtained from an embassy/consulate before travel.',
  no_admission: 'Entry is not permitted.',
  unknown: 'No reliable passport-index data is available for this route.',
};

export const LONG_STAY_NOTE =
  'Studying or working generally requires a purpose-specific visa or permit obtained before travel, even where tourist entry is visa-free.';

export const VISA_LABELS = {
  united_states: 'United States',
  schengen: 'Schengen area',
  united_kingdom: 'United Kingdom',
};

export const DATA_UPDATED_AT = visaDb._meta?.generatedAt || null;

function slugify(str) {
  return (str || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const countryNameByCode = {};
for (const c of countries) countryNameByCode[c.value] = c.label;

export function getCountryName(code) {
  return countryNameByCode[code] || code;
}

function paramSlug(code) {
  return slugify(getCountryName(code));
}

export function routeSlug(from, to) {
  return `${paramSlug(from)}-to-${paramSlug(to)}`;
}

const ROUTES = new Map();
for (const from of ORIGINS) {
  for (const to of DESTINATIONS) {
    if (from === to) continue;
    const slug = routeSlug(from, to);
    const existing = ROUTES.get(slug);
    if (existing && (existing.from !== from || existing.to !== to)) {
      throw new Error(
        `routeData: slug collision "${slug}" between ${existing.from}->${existing.to} and ${from}->${to}`
      );
    }
    ROUTES.set(slug, { slug, from, to });
  }
}

export function getAllRoutes() {
  return Array.from(ROUTES.values());
}

export function getRouteBySlug(slug) {
  return ROUTES.get(slug) || null;
}

export function getRelatedRoutes(from, excludeTo, limit = 10) {
  return getAllRoutes()
    .filter((r) => r.from === from && r.to !== excludeTo)
    .map((r) => ({ ...r, toName: getCountryName(r.to) }))
    .sort((a, b) => a.toName.localeCompare(b.toName))
    .slice(0, limit);
}

export function formatUpdatedDate(iso) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function getRouteInfo(from, to) {
  const fromName = getCountryName(from);
  const toName = getCountryName(to);

  let category;
  let maxStayDays = null;
  let description;

  if (from === to) {
    category = 'visa_free';
    description = 'This is your country of nationality — no visa is required.';
  } else if (EU_EEA_CH.includes(from) && EU_EEA_CH.includes(to)) {
    category = 'visa_free';
    description =
      'Freedom of movement: citizens of EU/EEA countries and Switzerland may visit, live, work, and study in other member states without a visa.';
  } else if ((from === 'GB' && to === 'IE') || (from === 'IE' && to === 'GB')) {
    category = 'visa_free';
    description =
      'Common Travel Area: British and Irish citizens may live, work, and study freely in both countries.';
  } else if ((from === 'AU' && to === 'NZ') || (from === 'NZ' && to === 'AU')) {
    category = 'visa_free';
    description =
      "Trans-Tasman arrangement: Australian and New Zealand citizens may visit, live, and work in each other's countries (New Zealanders receive a Special Category Visa automatically on arrival in Australia).";
  } else {
    category = visaDb.data?.[from]?.[to] || 'unknown';
    maxStayDays = visaDb.days?.[from]?.[to] ?? null;
    description = REQUIREMENT_DESCRIPTIONS[category] || REQUIREMENT_DESCRIPTIONS.unknown;
  }

  const waivers = (waiversDb.rules || []).filter(
    (rule) =>
      rule.destination === to &&
      (rule.nationalities === 'all' || rule.nationalities.includes(from))
  );

  return {
    from,
    to,
    fromName,
    toName,
    category,
    label: CATEGORY_LABELS[category] || CATEGORY_LABELS.unknown,
    description,
    maxStayDays,
    waivers,
    dataUpdatedAt: DATA_UPDATED_AT,
  };
}
