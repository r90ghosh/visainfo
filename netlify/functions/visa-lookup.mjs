import { createRequire } from 'module';
import { GoogleGenAI } from '@google/genai';

const require = createRequire(import.meta.url);
const visaDb = require('./visa-requirements.json');

const REQUIREMENT_DESCRIPTIONS = {
  visa_free: 'No visa required for short-term stays.',
  visa_on_arrival: 'A visa can be obtained on arrival at the destination.',
  eta: 'An Electronic Travel Authorization (eTA) is required before travel.',
  e_visa: 'An e-Visa must be obtained online before travel.',
  visa_required: 'A visa must be obtained from an embassy/consulate before travel.',
  no_admission: 'Entry is not permitted.',
};

function getVisaRequirement(from, to) {
  const requirement = visaDb.data?.[from]?.[to];
  if (!requirement) return null;
  return {
    required: !['visa_free', 'visa_on_arrival'].includes(requirement),
    requirement,
    description: REQUIREMENT_DESCRIPTIONS[requirement] || requirement,
  };
}

function buildPrompt({
  residentCountryName,
  nationalityCountryName,
  destinationCountryName,
  travelReason,
  currentVisas,
  visaReq,
}) {
  const visasHeld = currentVisas?.length
    ? `They currently hold visas for: ${currentVisas.join(', ')}.`
    : 'They do not currently hold any other visas.';

  const visaContext = visaReq
    ? `Based on passport index data, the visa requirement status is: "${visaReq.requirement}" — ${visaReq.description}`
    : 'No passport index data is available for this route.';

  return `You are a visa and immigration information assistant. A user needs visa information for international travel.

User details:
- Nationality: ${nationalityCountryName}
- Country of residence: ${residentCountryName}
- Destination country: ${destinationCountryName}
- Purpose of travel: ${travelReason}
- ${visasHeld}

${visaContext}

Please provide the following information as a JSON object:
1. "visaType": The specific visa type/category they should apply for (e.g. "B-1/B-2 Tourist Visa", "Schengen Short-Stay Visa"). If no visa is required, state "No visa required".
2. "embassyInfo": An object with "name" and "address" of the ${destinationCountryName} embassy or consulate in ${residentCountryName} that handles visa applications.
3. "applicationFormUrl": The URL where they can find or download the visa application form.
4. "applicationCost": The visa application fee amount and currency.
5. "currentWaitTime": The estimated current processing/wait time for this visa type.

Important instructions:
- If you're not confident about a URL, provide the official government immigration page instead.
- If information is unavailable, say "Information not available - please check with the embassy directly."
- Respond ONLY with a valid JSON object containing these 5 fields, no additional text.`;
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

  // Step 1: Check visa requirement via needs-visa
  let visaReq = null;
  try {
    visaReq = getVisaRequirement(nationalityCountry, destinationCountry);
  } catch {
    // needs-visa may not have data for this route — we'll rely on Gemini
  }

  // Step 2: Call Gemini for detailed visa information
  let geminiData = null;
  let geminiError = null;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    geminiError = 'GEMINI_API_KEY is not configured';
  } else {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = buildPrompt({
        residentCountryName: residentCountryName || residentCountry,
        nationalityCountryName: nationalityCountryName || nationalityCountry,
        destinationCountryName: destinationCountryName || destinationCountry,
        travelReason,
        currentVisas,
        visaReq,
      });

      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = result.text;
      geminiData = JSON.parse(text);
    } catch (err) {
      geminiError = err.message || 'Gemini API request failed';
    }
  }

  // Step 3: Build response
  const unavailable = 'Information not available - please check with the embassy directly.';

  // If both sources failed, return 503
  if (!visaReq && !geminiData) {
    return new Response(
      JSON.stringify({
        error: 'Unable to retrieve visa information at this time. Please try again later.',
        details: geminiError,
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const response = {
    visaRequired: visaReq ? (visaReq.required ? 'Yes' : 'No') : (geminiData?.visaType === 'No visa required' ? 'No' : 'Yes'),
    visaRequirement: visaReq?.requirement || unavailable,
    visaDescription: visaReq?.description || unavailable,
    visaType: geminiData?.visaType || unavailable,
    embassyInfo: geminiData?.embassyInfo || { name: unavailable, address: unavailable },
    applicationFormUrl: geminiData?.applicationFormUrl || unavailable,
    applicationCost: geminiData?.applicationCost || unavailable,
    currentWaitTime: geminiData?.currentWaitTime || unavailable,
    ...(geminiError && { aiError: geminiError }),
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
