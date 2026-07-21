import { createRequire } from 'module';
import { GoogleGenAI, Type } from '@google/genai';
import { getStore } from '@netlify/blobs';

const require = createRequire(import.meta.url);
const visaDb = require('./visa-requirements.json');
const waiversDb = require('./visa-waivers.json');

const CACHE_TTL_MS = 14 * 24 * 60 * 60 * 1000;

const VISA_LABELS = {
  united_states: 'United States',
  schengen: 'Schengen area',
  united_kingdom: 'United Kingdom',
};

const EU_EEA_CH = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
  'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
  'SI', 'ES', 'SE', 'IS', 'LI', 'NO', 'CH',
];

const CATEGORY_RANK = {
  visa_free: 0,
  eta: 1,
  visa_on_arrival: 2,
  e_visa: 3,
  visa_required: 4,
  no_admission: 99,
  unknown: 50,
};

const CATEGORY_LABELS = {
  visa_free: 'No visa required',
  eta: 'eTA required',
  e_visa: 'e-Visa required',
  visa_on_arrival: 'Visa on arrival',
  visa_required: 'Visa required',
  no_admission: 'Entry not permitted',
  long_stay: 'Visa / permit required',
  unknown: 'Check requirements',
};

const REQUIREMENT_DESCRIPTIONS = {
  visa_free: 'No visa required for short-term stays.',
  visa_on_arrival: 'A visa can be obtained on arrival at the destination.',
  eta: 'An Electronic Travel Authorization (eTA) is required before travel.',
  e_visa: 'An e-Visa must be obtained online before travel.',
  visa_required: 'A visa must be obtained from an embassy/consulate before travel.',
  no_admission: 'Entry is not permitted.',
  long_stay: 'Studying or working generally requires a purpose-specific visa or permit obtained before travel, even where tourist entry is visa-free.',
  unknown: 'No reliable passport-index data is available for this route.',
};

function normalizePurpose(travelReason) {
  return (travelReason || '').trim().toLowerCase() === 'tourism' ? 'tourism' : 'long_stay';
}

function resolveRequirement({ nationality, destination, travelReason, currentVisas }) {
  // 1. Same country
  if (nationality === destination) {
    return {
      category: 'visa_free',
      maxStayDays: null,
      description: 'This is your country of nationality — no visa is required.',
      waiver: null,
      shortStayNote: null,
    };
  }

  // 2. Freedom of movement carve-outs (apply for any purpose)
  if (EU_EEA_CH.includes(nationality) && EU_EEA_CH.includes(destination)) {
    return {
      category: 'visa_free',
      maxStayDays: null,
      description: 'Freedom of movement: citizens of EU/EEA countries and Switzerland may visit, live, work, and study in other member states without a visa.',
      waiver: null,
      shortStayNote: null,
    };
  }
  if ((nationality === 'GB' && destination === 'IE') || (nationality === 'IE' && destination === 'GB')) {
    return {
      category: 'visa_free',
      maxStayDays: null,
      description: 'Common Travel Area: British and Irish citizens may live, work, and study freely in both countries.',
      waiver: null,
      shortStayNote: null,
    };
  }
  if ((nationality === 'AU' && destination === 'NZ') || (nationality === 'NZ' && destination === 'AU')) {
    return {
      category: 'visa_free',
      maxStayDays: null,
      description: "Trans-Tasman arrangement: Australian and New Zealand citizens may visit, live, and work in each other's countries (New Zealanders receive a Special Category Visa automatically on arrival in Australia).",
      waiver: null,
      shortStayNote: null,
    };
  }

  // 3. Passport-index data
  const baseCategory = visaDb.data?.[nationality]?.[destination] || null;
  const baseDays = visaDb.days?.[nationality]?.[destination] ?? null;

  // 4. Non-tourism purpose
  const purpose = normalizePurpose(travelReason);
  if (purpose !== 'tourism') {
    return {
      category: 'long_stay',
      maxStayDays: null,
      description: REQUIREMENT_DESCRIPTIONS.long_stay,
      waiver: null,
      shortStayNote: baseCategory
        ? `For short tourist visits this route is: ${CATEGORY_LABELS[baseCategory] || baseCategory}.`
        : null,
    };
  }

  // 5/6. Tourism, no passport-index data — unknown
  if (!baseCategory) {
    return {
      category: 'unknown',
      maxStayDays: null,
      description: REQUIREMENT_DESCRIPTIONS.unknown,
      waiver: null,
      shortStayNote: null,
    };
  }

  // 5. Tourism, with passport-index data — apply waiver rules
  let category = baseCategory;
  let maxStayDays = baseDays;
  let waiver = null;

  if (baseCategory !== 'no_admission') {
    const baseRank = CATEGORY_RANK[baseCategory] ?? 50;
    let bestRule = null;
    let bestRank = Infinity;

    for (const rule of waiversDb.rules) {
      if (rule.destination !== destination) continue;
      const matchedHeldValue = currentVisas.find((v) => rule.heldVisas.includes(v));
      if (!matchedHeldValue) continue;
      if (rule.nationalities !== 'all' && !rule.nationalities.includes(nationality)) continue;

      const rank = CATEGORY_RANK[rule.requirement] ?? 50;
      if (rank >= baseRank) continue;
      if (rank < bestRank) {
        bestRank = rank;
        bestRule = { ...rule, matchedHeldValue };
      }
    }

    if (bestRule) {
      category = bestRule.requirement;
      maxStayDays = bestRule.maxStayDays;
      waiver = {
        heldVisa: VISA_LABELS[bestRule.matchedHeldValue],
        requirement: bestRule.requirement,
        maxStayDays: bestRule.maxStayDays,
        conditions: bestRule.conditions,
      };
    }
  }

  return {
    category,
    maxStayDays,
    description: REQUIREMENT_DESCRIPTIONS[category] || category,
    waiver,
    shortStayNote: null,
  };
}

function slugify(str) {
  return (str || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    visaType: { type: Type.STRING },
    embassyInfo: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        address: { type: Type.STRING },
      },
      required: ['name', 'address'],
    },
    applicationFormUrl: { type: Type.STRING },
    applicationCost: { type: Type.STRING },
    processingTime: { type: Type.STRING },
    additionalNotes: { type: Type.STRING },
  },
  required: ['visaType', 'embassyInfo', 'applicationFormUrl', 'applicationCost', 'processingTime'],
};

function buildPrompt({
  nationalityCountryName,
  residentCountryName,
  destinationCountryName,
  travelReasonLabel,
  purpose,
  heldVisaLabels,
  resolved,
}) {
  const visasHeld = heldVisaLabels.length
    ? `They currently hold valid visas for: ${heldVisaLabels.join(', ')}.`
    : 'They do not currently hold any other visas.';

  let authoritative;
  if (resolved.category === 'unknown') {
    authoritative = 'No authoritative passport-index data exists for this route. Use your best knowledge to determine whether a visa is required and what type.';
  } else {
    const label = CATEGORY_LABELS[resolved.category] || resolved.category;
    authoritative = `Authoritative determination (do not contradict it): ${label} — ${resolved.description}`;
    if (resolved.waiver) {
      authoritative += ` This applies because of a visa waiver for holders of a valid ${resolved.waiver.heldVisa} visa: ${resolved.waiver.conditions}`;
    }
  }

  const longStayNote = purpose === 'long_stay'
    ? ` Recommend the specific study/work visa or permit category for a ${nationalityCountryName} citizen going to ${destinationCountryName} (e.g. student visa subclass, work permit, EU Blue Card).`
    : '';

  return `You are a visa and immigration information assistant. A user needs visa information for international travel.

User details:
- Nationality: ${nationalityCountryName}
- Country of residence: ${residentCountryName}
- Destination country: ${destinationCountryName}
- Purpose of travel: ${travelReasonLabel}
- ${visasHeld}

${authoritative}

CRITICAL: Passport-index short-stay data applies ONLY to tourist visits. The user's purpose is ${travelReasonLabel}.${longStayNote}

Please provide the following information as a JSON object:
1. "visaType": The specific visa type/category they should apply for (e.g. "B-1/B-2 Tourist Visa", "Schengen Short-Stay Visa", "Student Visa Subclass 500"). If no visa is required, state "No visa required".
2. "embassyInfo": An object with "name" and "address" of the ${destinationCountryName} embassy or consulate in ${residentCountryName} that handles visa applications.
3. "applicationFormUrl": The URL where they can find or download the visa application form.
4. "applicationCost": The visa application fee amount and currency.
5. "processingTime": The typical processing time for this visa type (not live wait time).
6. "additionalNotes": Any other important details the traveler should know (optional, leave empty string if none).

Important instructions:
- Use official government URLs only. For "applicationFormUrl" give the main official immigration/visa portal homepage — never construct deep links to PDFs or documents from memory.
- Never invent a street address. If you're not sure of the exact embassy address, give the city and say "verify on EmbassyPages".
- If information is unavailable, say "Information not available - please check with the embassy directly."
- Keep every field concise. "additionalNotes" must be at most 3 sentences.
- Respond ONLY with a valid JSON object containing these 6 fields, no additional text.`;
}

async function getCachedGemini(key) {
  try {
    const store = getStore('visa-cache');
    const cached = await store.get(key, { type: 'json' });
    if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
      return cached.data;
    }
  } catch {
    // Blobs unavailable (e.g. local dev without blob support) — fall through
  }
  return null;
}

async function setCachedGemini(key, data) {
  try {
    const store = getStore('visa-cache');
    await store.setJSON(key, { cachedAt: Date.now(), data });
  } catch {
    // Blobs unavailable — ignore, caching is best-effort
  }
}

function computeVisaRequired(category, geminiData) {
  if (category === 'unknown') {
    return geminiData?.visaType === 'No visa required' ? 'No' : 'Yes';
  }
  return category === 'visa_free' ? 'No' : 'Yes';
}

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const {
    residentCountry,
    nationalityCountry,
    destinationCountry,
    travelReason,
    currentVisas,
    residentCountryName,
    nationalityCountryName,
    destinationCountryName,
  } = body;

  if (!residentCountry || !nationalityCountry || !destinationCountry || !travelReason) {
    return new Response(
      JSON.stringify({
        error: 'Missing required fields: residentCountry, nationalityCountry, destinationCountry, travelReason',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const heldVisaValues = Array.isArray(currentVisas)
    ? currentVisas.filter((v) => VISA_LABELS[v])
    : [];
  const heldVisaLabels = heldVisaValues.map((v) => VISA_LABELS[v]);

  const purpose = normalizePurpose(travelReason);
  const resolved = resolveRequirement({
    nationality: nationalityCountry,
    destination: destinationCountry,
    travelReason,
    currentVisas: heldVisaValues,
  });

  const skipAI = resolved.category === 'visa_free' || resolved.category === 'no_admission';

  const resolvedResidentCountryName = residentCountryName || residentCountry;
  const resolvedNationalityCountryName = nationalityCountryName || nationalityCountry;
  const resolvedDestinationCountryName = destinationCountryName || destinationCountry;

  let geminiData = null;
  let geminiError = null;

  if (!skipAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      geminiError = 'GEMINI_API_KEY is not configured';
    } else {
      const cacheKey = `v2:${nationalityCountry}:${destinationCountry}:${residentCountry}:${travelReason.trim().toLowerCase()}:${[...heldVisaValues].sort().join(',')}`;
      geminiData = await getCachedGemini(cacheKey);

      if (!geminiData) {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const prompt = buildPrompt({
            nationalityCountryName: resolvedNationalityCountryName,
            residentCountryName: resolvedResidentCountryName,
            destinationCountryName: resolvedDestinationCountryName,
            travelReasonLabel: travelReason,
            purpose,
            heldVisaLabels,
            resolved,
          });

          const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema,
              temperature: 0,
              maxOutputTokens: 2048,
              // Factual recall, not reasoning — thinking burns the output budget
              // and truncates the JSON mid-string.
              thinkingConfig: { thinkingBudget: 0 },
            },
          });

          geminiData = JSON.parse(result.text);
          await setCachedGemini(cacheKey, geminiData);
        } catch (err) {
          geminiError = err.message || 'Gemini API request failed';
        }
      }
    }
  }

  // If there's no deterministic data and the AI failed, we have nothing to return
  if (resolved.category === 'unknown' && !geminiData) {
    return new Response(
      JSON.stringify({
        error: 'Unable to retrieve visa information at this time. Please try again later.',
        details: geminiError,
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const unavailable = 'Information not available - please check with the embassy directly.';

  let visaType;
  let embassyInfo;
  let applicationFormUrl;
  let applicationCost;
  let processingTime;
  let additionalNotes;

  if (resolved.category === 'visa_free') {
    visaType = `No visa required${resolved.maxStayDays ? ` for stays up to ${resolved.maxStayDays} days` : ''}`;
    embassyInfo = { name: 'No visa application needed', address: '' };
    applicationFormUrl = '';
    applicationCost = 'None';
    processingTime = 'N/A';
  } else if (resolved.category === 'no_admission') {
    visaType = 'Entry not permitted — contact the nearest embassy';
    embassyInfo = { name: "Contact the destination country's embassy in your country of residence", address: '' };
    applicationFormUrl = '';
    applicationCost = '';
    processingTime = 'N/A';
  } else {
    visaType = geminiData?.visaType || unavailable;
    embassyInfo = geminiData?.embassyInfo || { name: unavailable, address: unavailable };
    applicationFormUrl = geminiData?.applicationFormUrl || '';
    applicationCost = geminiData?.applicationCost || unavailable;
    processingTime = geminiData?.processingTime || unavailable;
    additionalNotes = geminiData?.additionalNotes || undefined;

    // Reconciliation: deterministic category wins if the AI contradicts it
    if (/no visa/i.test(visaType) && resolved.category !== 'unknown') {
      visaType = `${CATEGORY_LABELS[resolved.category] || resolved.category} (see details)`;
    }
  }

  const visaRequired = computeVisaRequired(resolved.category, geminiData);
  const embassyDirectoryUrl = `https://www.embassypages.com/${slugify(resolvedDestinationCountryName)}`;

  const response = {
    visaRequired,
    requirementCategory: resolved.category,
    requirementLabel: CATEGORY_LABELS[resolved.category] || resolved.category,
    requirementDescription: resolved.description,
    maxStayDays: resolved.maxStayDays ?? null,
    waiver: resolved.waiver,
    shortStayNote: resolved.shortStayNote,
    visaType,
    embassyInfo,
    embassyDirectoryUrl,
    applicationFormUrl,
    applicationCost,
    processingTime,
    ...(additionalNotes && { additionalNotes }),
    ...(geminiError && { aiError: geminiError }),
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
