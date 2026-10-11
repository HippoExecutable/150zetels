#!/usr/bin/env node
// One-off cleanup for 150zetels. Run from the repo root:  node only-nl-en.mjs
//
// 1. Renames the four translation keys in nl.json and en.json
//      header.countries -> header.presets, header.sampleCountries -> header.polls,
//      body.sampleDataUpdatedAt -> body.pollUpdatedAt, body.countryName -> body.presetName
//    (and adds header.pastElections / body.electionDate if they are missing).
// 2. Removes de, fr and tr: deletes their .json files and takes them out of src/i18n/i18n.ts.
// 3. Changes the tests that used German ("de") to Dutch ("nl").

import fs from "node:fs";
import path from "node:path";

const src = path.join(process.cwd(), "src");
const warnings = [];
const read = (p) => fs.readFileSync(p, "utf8");
const write = (p, t) => fs.writeFileSync(p, t);

if (!fs.existsSync(path.join(src, "i18n/i18n.ts"))) {
  console.error("src/i18n/i18n.ts not found. Run this from the repo root.");
  process.exit(1);
}

// ---------- 1. translations ----------
const texts = {
  en: {
    presets: "Polls & elections",
    polls: "Polls",
    pastElections: "Past elections",
    pollUpdatedAt: "Poll updated at",
    presetName: "Name",
    electionDate: "Election date",
  },
  nl: {
    presets: "Peilingen & verkiezingen",
    polls: "Peilingen",
    pastElections: "Eerdere verkiezingen",
    pollUpdatedAt: "Peiling bijgewerkt op",
    presetName: "Naam",
    electionDate: "Verkiezingsdatum",
  },
};
const renames = {
  header: { countries: "presets", sampleCountries: "polls" },
  body: { sampleDataUpdatedAt: "pollUpdatedAt", countryName: "presetName" },
};

for (const [lang, values] of Object.entries(texts)) {
  const file = path.join(src, "i18n", `${lang}.json`);
  const text = read(file);
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  const data = JSON.parse(text);

  for (const [section, map] of Object.entries(renames)) {
    const next = {};
    for (const [key, value] of Object.entries(data[section] ?? {})) {
      const newKey = map[key];
      next[newKey ?? key] = newKey ? values[newKey] : value;
    }
    data[section] = next;
  }
  // Keys the app needs; add them only when missing
  if (!("pastElections" in data.header)) {
    const header = {};
    for (const [key, value] of Object.entries(data.header)) {
      header[key] = value;
      if (key === "polls") header.pastElections = values.pastElections;
    }
    if (!header.pastElections) header.pastElections = values.pastElections;
    data.header = header;
  }
  if (!("electionDate" in data.body))
    data.body.electionDate = values.electionDate;

  let out = JSON.stringify(data, null, 2) + (/\n$/.test(text) ? "\n" : "");
  if (eol === "\r\n") out = out.replace(/\n/g, "\r\n");
  write(file, out);
}

// ---------- 2. remove de, fr, tr ----------
for (const lang of ["de", "fr", "tr"]) {
  fs.rmSync(path.join(src, "i18n", `${lang}.json`), { force: true });
}
const i18nFile = path.join(src, "i18n/i18n.ts");
{
  const t = read(i18nFile);
  const next = t
    .replace(/^import (?:fr|de|tr) from "\.\/(?:fr|de|tr)\.json"[^\n]*\n/gm, "")
    .replace(
      /export const locales = \{[^}]*\} as const;/,
      "export const locales = { en, nl } as const;",
    );
  if (
    /\b(?:fr|de|tr)\b/.test(
      next
        .split("\n")
        .filter((l) => /import|locales =/.test(l))
        .join("\n"),
    )
  )
    warnings.push(
      "src/i18n/i18n.ts still mentions fr/de/tr. Check the imports and `locales` by hand.",
    );
  write(i18nFile, next);
}

// ---------- 3. tests that used German ----------
const shareTest = path.join(src, "tests/shareLink.test.ts");
if (fs.existsSync(shareTest)) {
  const t = read(shareTest);
  write(
    shareTest,
    t.replace('locale: "de"', 'locale: "nl"').replace(/lang=de\b/g, "lang=nl"),
  );
}

console.log("Done. Now run:  npm run format && npm run build && npm test");
for (const w of warnings) console.log(`\nWARNING: ${w}`);
