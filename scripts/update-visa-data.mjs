#!/usr/bin/env node
// Regenerates netlify/functions/visa-requirements.json from the passport-index-data dataset.

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const PRIMARY_URL =
  "https://raw.githubusercontent.com/imorte/passport-index-data/main/passport-index-tidy-iso2.csv";
const FALLBACK_URL =
  "https://raw.githubusercontent.com/ilyankou/passport-index-dataset/master/passport-index-tidy-iso2.csv";

const OUTPUT_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "netlify",
  "functions",
  "visa-requirements.json"
);

const REQUIREMENTS = {
  visa_free: "No visa needed. Entry is permitted freely.",
  visa_on_arrival: "Visa can be obtained upon arrival. No prior embassy visit needed.",
  eta: "Electronic Travel Authorisation required. Applied online before travel.",
  e_visa: "Electronic visa required. Must be obtained online before travel.",
  visa_required: "A visa must be obtained from an embassy/consulate before travel.",
  no_admission: "Entry not permitted or passport not recognized.",
  unknown: "Requirement unknown. Check official government sources.",
};

async function fetchCsv() {
  for (const url of [PRIMARY_URL, FALLBACK_URL]) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`Fetch failed for ${url}: HTTP ${res.status}`);
        continue;
      }
      const text = await res.text();
      return { url, text };
    } catch (err) {
      console.warn(`Fetch error for ${url}: ${err.message}`);
    }
  }
  throw new Error("Both primary and fallback CSV sources failed.");
}

function classifyRequirement(raw, warnedUnknown) {
  const value = raw.trim();

  if (value === "-1") {
    return { skip: true };
  }

  if (/^\d+$/.test(value)) {
    return { category: "visa_free", days: Number(value) };
  }

  const lower = value.toLowerCase();
  switch (lower) {
    case "visa free":
      return { category: "visa_free" };
    case "visa on arrival":
      return { category: "visa_on_arrival" };
    case "e-visa":
      return { category: "e_visa" };
    case "eta":
      return { category: "eta" };
    case "visa required":
      return { category: "visa_required" };
    case "no admission":
      return { category: "no_admission" };
    case "covid ban":
      return { category: "no_admission" };
    default:
      if (!warnedUnknown.has(lower)) {
        warnedUnknown.add(lower);
        console.warn(`Unrecognized requirement value: "${value}"`);
      }
      return { category: "unknown" };
  }
}

async function main() {
  const { url, text } = await fetchCsv();

  const lines = text.split(/\r?\n/).filter((line) => line.length > 0);
  const [, ...rows] = lines; // skip header

  const data = {};
  const days = {};
  const requirementCounts = {};
  const passports = new Set();
  const warnedUnknown = new Set();
  let totalPairs = 0;
  let dayEntries = 0;

  for (const row of rows) {
    const [from, to, requirement] = row.split(",");
    if (!from || !to || requirement === undefined) continue;

    passports.add(from);
    passports.add(to);

    const result = classifyRequirement(requirement, warnedUnknown);
    if (result.skip) continue;

    if (!data[from]) data[from] = {};
    data[from][to] = result.category;

    requirementCounts[result.category] = (requirementCounts[result.category] || 0) + 1;
    totalPairs += 1;

    if (typeof result.days === "number") {
      if (!days[from]) days[from] = {};
      days[from][to] = result.days;
      dayEntries += 1;
    }
  }

  const output = {
    _meta: {
      source: url,
      license: "MIT",
      generatedAt: new Date().toISOString(),
      passportCount: passports.size,
      totalPairs,
      requirementCounts,
      requirements: REQUIREMENTS,
    },
    data,
    days,
  };

  await writeFile(OUTPUT_PATH, JSON.stringify(output));

  console.log(`Source: ${url}`);
  console.log(`Passports: ${passports.size}`);
  console.log(`Total pairs: ${totalPairs}`);
  console.log(`Day-count entries: ${dayEntries}`);
  console.log("Requirement counts:");
  for (const [category, count] of Object.entries(requirementCounts)) {
    console.log(`  ${category}: ${count}`);
  }
  console.log(`Written to ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
