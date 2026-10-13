#!/usr/bin/env node
// Run from the repo root:  node add-coalitions.mjs
//
// Edits YOUR src/data/pastElections.ts in place (everything else in the file, such as
// emoji, stays as it is):
//  - fixes three cabinet names: 1948 -> Drees I, 1952 -> Drees III, 1956 -> Drees IV
//  - adds `coalition: [...]` (party ids) and, where useful, `description` to every election
// Entries that already have a `coalition` are left alone, so it is safe to run twice.

import fs from "node:fs";
import path from "node:path";

const file = path.join(process.cwd(), "src/data/pastElections.ts");
if (!fs.existsSync(file)) {
  console.error("src/data/pastElections.ts not found. Run this from the repo root.");
  process.exit(1);
}

// year, new name, coalition (party keys, as in the ids "nl<year>-<key>"), description
const E = [
  [2025, "2025 (Jetten I)", ["d66", "vvd", "cda"], "Kabinet van D66, VVD en CDA, aangetreden op 23 februari 2026."],
  [2023, "2023 (Schoof)", ["pvv", "vvd", "nsc", "bbb"], "Kabinet van PVV, VVD, NSC en BBB, aangetreden op 2 juli 2024, zeven maanden na de verkiezingen. In juni 2025 stapte de PVV uit de coalitie en viel het kabinet."],
  [2021, "2021 (Rutte IV)", ["vvd", "d66", "cda", "cu"], "Kwam tot stand na de langste formatie sinds de Tweede Wereldoorlog: negen maanden na de verkiezingen."],
  [2017, "2017 (Rutte III)", ["vvd", "d66", "cda", "cu"], null],
  [2012, "2012 (Rutte II)", ["vvd", "pvda"], null],
  [2010, "2010 (Rutte I)", ["vvd", "cda"], "Minderheidskabinet van VVD en CDA. Voor een meerderheid in de Kamer sloten zij een gedoogakkoord met de PVV, die zelf geen deel uitmaakte van het kabinet."],
  [2006, "2006 (Balkenende IV)", ["cda", "pvda", "cu"], "Balkenende III (CDA en VVD, 2006-2007) was een overgangskabinet dat niet na verkiezingen werd gevormd, maar na het vertrek van D66 uit Balkenende II. Daarom hoort bij deze verkiezingen Balkenende IV."],
  [2003, "2003 (Balkenende II)", ["cda", "vvd", "d66"], null],
  [2002, "2002 (Balkenende I)", ["cda", "vvd", "lpf"], null],
  [1998, "1998 (Kok II)", ["pvda", "vvd", "d66"], null],
  [1994, "1994 (Kok I)", ["pvda", "vvd", "d66"], "Het eerste paarse kabinet: het rood van de PvdA gemengd met het blauw van de VVD."],
  [1989, "1989 (Lubbers III)", ["cda", "pvda"], null],
  [1986, "1986 (Lubbers II)", ["cda", "vvd"], null],
  [1982, "1982 (Lubbers I)", ["cda", "vvd"], null],
  [1981, "1981 (Van Agt II)", ["cda", "pvda", "d66"], "Na het vertrek van de PvdA-bewindslieden volgde in 1982 het minderheidskabinet Van Agt III van CDA en D66."],
  [1977, "1977 (Van Agt I)", ["cda", "vvd"], "De PvdA werd de grootste partij, maar werd niet in het kabinet opgenomen."],
  [1972, "1972 (Den Uyl)", ["pvda", "d66", "ppr", "kvp", "arp"], "Gezien als het meest links-progressieve kabinet uit de parlementaire geschiedenis."],
  [1971, "1971 (Biesheuvel I)", ["kvp", "chu", "arp", "vvd", "ds70"], "Hierop volgde het kabinet Biesheuvel II (1972-1973)."],
  [1967, "1967 (De Jong)", ["kvp", "arp", "chu", "vvd"], null],
  [1963, "1963 (Marijnen)", ["kvp", "arp", "chu", "vvd"], "Opgevolgd zonder verkiezingen door Cals (KVP, PvdA en ARP, 1965-1966) en het overgangskabinet Zijlstra (KVP en ARP, 1966-1967)."],
  [1959, "1959 (De Quay)", ["kvp", "arp", "chu", "vvd"], "Het eerste naoorlogse kabinet zonder de PvdA."],
  [1956, "1956 (Drees IV)", ["pvda", "kvp", "arp", "chu"], "Het laatste rooms-rode kabinet. Na de val in 1958 volgde het overgangskabinet Beel II (KVP, ARP en CHU), dat nieuwe verkiezingen uitschreef."],
  [1952, "1952 (Drees III)", ["pvda", "kvp", "arp", "chu"], "Met één partijloze minister. De ARP nam de plaats in van de VVD uit het kabinet Drees II."],
  [1948, "1948 (Drees I)", ["kvp", "pvda", "chu", "vvd"], "Extraparlementair kabinet met twee partijloze ministers: de fracties waren niet gebonden aan een regeerprogramma. In 1951 volgde Drees II zonder verkiezingen."],
  [1946, "1946 (Beel I)", ["kvp", "pvda"], "Kabinet van KVP en PvdA met drie partijloze bewindslieden, het eerste van de rooms-rode kabinetten."],
];

let text = fs.readFileSync(file, "utf8");
const eol = text.includes("\r\n") ? "\r\n" : "\n";
const warnings = [];
let changed = 0;

// Entry boundaries: every `name: "<year> (...)"` line
const nameRe = /name: "(\d{4}) \([^"\n]*\)",/g;
const found = [...text.matchAll(nameRe)].map((m) => ({
  year: Number(m[1]),
  index: m.index,
  length: m[0].length,
}));

// One entry per election year is expected
for (const [year] of E) {
  const n = found.filter((f) => f.year === year).length;
  if (n !== 1) warnings.push(`${year}: found ${n} entries named "${year} (...)", skipped.`);
}

// Work from the bottom up so earlier positions stay valid
const order = [...found].sort((a, b) => b.index - a.index);
for (const entry of order) {
  const spec = E.find((e) => e[0] === entry.year);
  if (!spec || found.filter((f) => f.year === entry.year).length !== 1) continue;
  const [year, newName, keys, description] = spec;
  const next = found.filter((f) => f.index > entry.index).sort((a, b) => a.index - b.index)[0];
  const end = next ? next.index : text.length;
  const body = text.slice(entry.index, end);

  const ids = keys.map((k) => `nl${year}-${k}`);
  const missing = ids.filter((id) => !body.includes(`id: "${id}"`));
  if (missing.length) {
    warnings.push(`${year}: party id(s) not found (${missing.join(", ")}), skipped.`);
    continue;
  }

  let newBody = body.replace(nameRe, `name: "${newName}",`);
  if (!/\n\s*coalition:/.test(newBody)) {
    const m = newBody.match(/^([ \t]*)updateDate: "[^"\n]*",\r?\n/m);
    if (!m) {
      warnings.push(`${year}: no updateDate line found, skipped.`);
      continue;
    }
    const indent = m[1];
    let add = "";
    if (description && !/\n\s*description:/.test(newBody)) {
      add += `${indent}description: ${JSON.stringify(description)},${eol}`;
    }
    add += `${indent}coalition: [${ids.map((id) => JSON.stringify(id)).join(", ")}],${eol}`;
    const at = m.index + m[0].length;
    newBody = newBody.slice(0, at) + add + newBody.slice(at);
  }
  if (newBody !== body) {
    text = text.slice(0, entry.index) + newBody + text.slice(end);
    changed++;
  }
}

fs.writeFileSync(file, text);
console.log(`Updated ${changed} of ${E.length} elections. Now run:  npm run format && npm run build && npm test`);
for (const w of warnings) console.log(`WARNING: ${w}`);
