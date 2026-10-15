/*
    Parliament (parliament-seats) is a tool for visualizing and calculating
    the distribution of seats in a parliamentary system.

    Copyright (C) 2025 @disfordave

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { currentRooms } from "./currentRooms";
import { pastElections } from "./pastElections";
import { polls } from "./polls";

export interface PartyInfo {
  key: string;
  name: string;
  shortName: string;
  // The first colour is the one used in the charts
  colours: string[];
  // Title of the article on nl.wikipedia.org, left out to link to a search
  wikipedia?: string;
  // Path of the page on parlement.com after /partij/, left out to link to a
  // search
  parlement?: string;
  // The parties that merged into this one, and the year they did
  fusion?: { year: number; parties: string[] };
  // The party this one split off from, and the year it did
  split?: { year: number; from: string };
}

const info = (
  key: string,
  name: string,
  shortName: string,
  colours: string[],
  wikipedia?: string,
  fusion?: PartyInfo["fusion"],
): PartyInfo => ({ key, name, shortName, colours, wikipedia, fusion });

// Keyed by the last part of a party's id, e.g. "nl2025-pvv" and "tk-pvv" are
// both "pvv"
export const partyInfo: Record<string, PartyInfo> = Object.fromEntries(
  [
    // Current parties
    info(
      "pvv",
      "Partij voor de Vrijheid",
      "PVV",
      ["#012758"],
      "Partij voor de Vrijheid",
    ),
    info(
      "vvd",
      "Volkspartij voor Vrijheid en Democratie",
      "VVD",
      ["#0A2CCA"],
      "Volkspartij voor Vrijheid en Democratie",
      { year: 1948, parties: ["pvdv"] },
    ),
    info(
      "pro",
      "Progressief Nederland",
      "PRO",
      ["#ff0000", "#39A935"],
      "Progressief Nederland",
      { year: 2026, parties: ["gl", "pvda"] },
    ),
    info("d66", "Democraten 66", "D66", ["#00AE41"], "Democraten 66"),
    info(
      "cda",
      "Christen-Democratisch Appèl",
      "CDA",
      ["#2CC84D"],
      "Christen-Democratisch Appèl",
      { year: 1980, parties: ["kvp", "arp", "chu"] },
    ),
    info("bbb", "BoerBurgerBeweging", "BBB", ["#94C11F"], "BoerBurgerBeweging"),
    info("volt", "Volt", "Volt", ["#582c83"], "Volt Nederland"),
    info(
      "pvdd",
      "Partij voor de Dieren",
      "PvdD",
      ["#006B2D"],
      "Partij voor de Dieren",
    ),
    info("cu", "ChristenUnie", "CU", ["#00A7EE"], "ChristenUnie", {
      year: 2000,
      parties: ["gpv", "rpf"],
    }),
    info(
      "sgp",
      "Staatkundig Gereformeerde Partij",
      "SGP",
      ["#EA5B0B"],
      "Staatkundig Gereformeerde Partij",
    ),
    info(
      "fvd",
      "Forum voor Democratie",
      "FvD",
      ["#841818"],
      "Forum voor Democratie",
    ),
    info(
      "sp",
      "Socialistische Partij",
      "SP",
      ["#F60000"],
      "Socialistische Partij (Nederland)",
    ),
    info("denk", "Denk", "Denk", ["#00B7B2"], "DENK"),
    info("ja21", "JA21", "JA21", ["#242B57"], "JA21"),
    info("50plus", "50PLUS", "50PLUS", ["#92107D"], "50PLUS"),
    info(
      "dna",
      "De Nederlandse Alliantie",
      "DNA",
      ["#354050"],
      "Groep Markuszower",
    ),
    info("monakeijzer", "Mona Keijzer", "MK", ["#354050"], "Mona Keijzer"),
    info(
      "nsc",
      "Nieuw Sociaal Contract",
      "NSC",
      ["#1B3A57"],
      "Nieuw Sociaal Contract",
    ),
    info(
      "opnl",
      "Onafhankelijke Politiek Nederland",
      "OPNL",
      ["#F7A600"],
      "Onafhankelijke Politiek Nederland",
    ),
    // One-member groups in the Eerste Kamer
    info(
      "visserenhamakers",
      "Fractie-Visseren-Hamakers",
      "Visseren-Hamakers",
      ["#71717A"],
      "Ingrid Visseren-Hamakers",
    ),
    info(
      "beukering",
      "Fractie-Beukering",
      "Beukering",
      ["#71717A"],
      "Toine Beukering",
    ),
    info("walenkamp", "Fractie-Walenkamp", "Walenkamp", ["#71717A"]),
    info(
      "vandesanden",
      "Fractie-Van de Sanden",
      "Van de Sanden",
      ["#71717A"],
      "Cees van de Sanden",
    ),
    info(
      "vangasteren",
      "Fractie-Van Gasteren",
      "Van Gasteren",
      ["#71717A"],
      "Robert van Gasteren",
    ),
    // Parties of the past
    info(
      "kvp",
      "Katholieke Volkspartij",
      "KVP",
      ["#E07B00"],
      "Katholieke Volkspartij (Nederland)",
    ),
    info(
      "pvda",
      "Partij van de Arbeid",
      "PvdA",
      ["#E2001A"],
      "Partij van de Arbeid (Nederland)",
    ),
    info(
      "arp",
      "Anti-Revolutionaire Partij",
      "ARP",
      ["#3B6FB6"],
      "Anti-Revolutionaire Partij",
    ),
    info(
      "cpn",
      "Communistische Partij van Nederland",
      "CPN",
      ["#8B0000"],
      "Communistische Partij van Nederland",
    ),
    info(
      "chu",
      "Christelijk-Historische Unie",
      "CHU",
      ["#6C8EBF"],
      "Christelijk-Historische Unie",
    ),
    info(
      "pvdv",
      "Partij van de Vrijheid",
      "PvdV",
      ["#5B7FE0"],
      "Partij van de Vrijheid",
    ),
    info(
      "knp",
      "Katholiek Nationale Partij",
      "KNP",
      ["#8B5E3C"],
      "Katholiek Nationale Partij",
    ),
    info(
      "psp",
      "Pacifistisch Socialistische Partij",
      "PSP",
      ["#E4572E"],
      "Pacifistisch Socialistische Partij",
    ),
    info("bp", "Boerenpartij", "BP", ["#7A8B2E"], "Boerenpartij (Nederland)"),
    info(
      "gpv",
      "Gereformeerd Politiek Verbond",
      "GPV",
      ["#F29B4B"],
      "Gereformeerd Politiek Verbond",
    ),
    info(
      "ds70",
      "Democratisch Socialisten '70",
      "DS'70",
      ["#C9A227"],
      "Democratisch Socialisten '70",
    ),
    info(
      "nmp",
      "Nederlandse Middenstands Partij",
      "NMP",
      ["#A8A29E"],
      "Nederlandse Middenstands Partij",
    ),
    info(
      "ppr",
      "Politieke Partij Radikalen",
      "PPR",
      ["#7DB46C"],
      "Politieke Partij Radikalen",
    ),
    info(
      "rkpn",
      "Rooms Katholieke Partij Nederland",
      "RKPN",
      ["#A0522D"],
      "Rooms Katholieke Partij Nederland",
    ),
    info(
      "rpf",
      "Reformatorische Politieke Federatie",
      "RPF",
      ["#F5B041"],
      "Reformatorische Politieke Federatie",
    ),
    info(
      "evp",
      "Evangelische Volkspartij",
      "EVP",
      ["#C7DA5A"],
      "Evangelische Volkspartij (Nederland)",
    ),
    info("cp", "Centrumpartij", "CP", ["#4B2E1E"], "Centrumpartij (Nederland)"),
    info("gl", "GroenLinks", "GL", ["#39A935"], "GroenLinks", {
      year: 1990,
      parties: ["cpn", "psp", "ppr", "evp"],
    }),
    info("cd", "Centrumdemocraten", "CD", ["#5C4033"], "Centrumdemocraten"),
    info(
      "aov",
      "Algemeen Ouderenverbond",
      "AOV",
      ["#F7B500"],
      "Algemeen Ouderen Verbond",
    ),
    info("unie55", "Unie 55+", "Unie 55+", ["#CCCC66"], "Unie 55+"),
    info("lpf", "Lijst Pim Fortuyn", "LPF", ["#00B2EE"], "Lijst Pim Fortuyn"),
    info(
      "ln",
      "Leefbaar Nederland",
      "LN",
      ["#6A5ACD"],
      "Leefbaar Nederland (1999-2007)",
    ),
    info("bij1", "BIJ1", "BIJ1", ["#E5B800"], "BIJ1"),
  ].map((party) => [party.key, party]),
);

// The year is when the members left, which can be before the party was founded
const splits: Record<string, PartyInfo["split"]> = {
  dna: { year: 2026, from: "pvv" },
  monakeijzer: { year: 2026, from: "bbb" },
  vangasteren: { year: 2026, from: "bbb" },
  visserenhamakers: { year: 2025, from: "pvdd" },
  vandesanden: { year: 2025, from: "vvd" },
  nsc: { year: 2021, from: "cda" },
  ja21: { year: 2020, from: "fvd" },
  denk: { year: 2014, from: "pvda" },
  pvv: { year: 2004, from: "vvd" },
  cd: { year: 1984, from: "cp" },
  rkpn: { year: 1972, from: "kvp" },
  ds70: { year: 1970, from: "pvda" },
  ppr: { year: 1968, from: "kvp" },
  knp: { year: 1948, from: "kvp" },
};
for (const [key, split] of Object.entries(splits)) partyInfo[key].split = split;

// Parties without a page, like one-member groups, link to a search instead
const parlementPages: Record<string, string> = {
  pvv: "pvv-partij-voor-de-vrijheid",
  vvd: "vvd-volkspartij-voor-vrijheid-en-democratie",
  pro: "progressief-nederland-pro",
  d66: "d66-democraten-66",
  cda: "cda-christen-democratisch-appel",
  bbb: "bbb-boerburgerbeweging",
  volt: "volt-nederland",
  pvdd: "pvdd-partij-voor-de-dieren",
  cu: "christenunie",
  sgp: "sgp-staatkundig-gereformeerde-partij",
  fvd: "fvd-forum-voor-democratie",
  sp: "sp-socialistische-partij",
  denk: "denk",
  ja21: "ja21-het-juiste-antwoord-21",
  "50plus": "50plus",
  nsc: "nsc-nieuw-sociaal-contract",
  opnl: "opnl-onafhankelijke-politiek-nederland",
  kvp: "kvp-katholieke-volkspartij",
  pvda: "pvda-partij-van-de-arbeid",
  arp: "arp-anti-revolutionaire-partij",
  cpn: "cpn-communistische-partij-van-nederland",
  chu: "chu-christelijk-historische-unie",
  pvdv: "pvdv-partij-van-de-vrijheid",
  knp: "knp-katholiek-nationale-partij",
  psp: "psp-pacifistisch-socialistische-partij",
  bp: "boerenpartij",
  gpv: "gpv-gereformeerd-politiek-verbond",
  ds70: "democratisch-socialisten-1970",
  nmp: "nederlandse-middenstands-partij",
  ppr: "ppr-politieke-partij-radikalen",
  rkpn: "rkpn-rooms-katholieke-partij-nederland",
  rpf: "rpf-reformatorische-politieke-federatie",
  evp: "evp-evangelische-volkspartij",
  cp: "cp-centrumpartij",
  gl: "groenlinks-gl",
  cd: "cd-centrumdemocraten",
  aov: "aov-algemeen-ouderen-verbond",
  unie55: "unie-55",
  lpf: "lpf-lijst-pim-fortuyn",
  ln: "leefbaar-nederland",
  bij1: "bij1",
};
for (const [key, page] of Object.entries(parlementPages)) {
  partyInfo[key].parlement = page;
}

// Lists that ran under another name than the party they belong to
const aliases: Record<string, string> = {
  // GroenLinks and the PvdA ran together before merging into PRO
  glpvda: "pro",
};

export function getPartyKey(id: string) {
  const key = id.split("-").pop() ?? id;
  return aliases[key] ?? key;
}

export function getPartyInfo(key: string | null | undefined) {
  return key ? (partyInfo[key] ?? null) : null;
}

export function getWikipediaUrl(party: PartyInfo) {
  return party.wikipedia
    ? `https://nl.wikipedia.org/wiki/${encodeURIComponent(party.wikipedia.replace(/ /g, "_"))}`
    : `https://nl.wikipedia.org/w/index.php?search=${encodeURIComponent(party.name)}`;
}

export function getParlementUrl(party: PartyInfo) {
  return party.parlement
    ? `https://www.parlement.com/partij/${party.parlement}`
    : `https://www.parlement.com/zoeken?q=${encodeURIComponent(party.name.replace(/^Fractie-/, ""))}`;
}

// The party that this one merged into, if any
export function getSuccessor(key: string) {
  return (
    Object.values(partyInfo).find((party) =>
      party.fusion?.parties.includes(key),
    ) ?? null
  );
}

function seatsIn(name: string, key: string, presets = currentRooms) {
  const preset = presets.find((p) => p.name === name);
  if (!preset) return null;

  return preset.parties
    .filter((party) => getPartyKey(party.id) === key)
    .reduce((acc, party) => acc + party.seats, 0);
}

export const defaultPoll = "Ipsos I&O";

export function isPoll(presetName: string | null | undefined) {
  return polls.some((poll) => poll.name === presetName);
}

// The most recent Tweede Kamer election
export function getLatestElection() {
  return [...pastElections].sort((a, b) =>
    b.updateDate.localeCompare(a.updateDate),
  )[0];
}

export function getLatestElectionSeats(key: string) {
  const election = getLatestElection();
  return {
    year: Number(election.updateDate.slice(0, 4)),
    seats: seatsIn(election.name, key, pastElections) ?? 0,
  };
}

export function getCurrentSeats(key: string, pollName = defaultPoll) {
  return {
    tweedeKamer: seatsIn("Tweede Kamer", key),
    eersteKamer: seatsIn("Eerste Kamer", key),
    europeesParlement: seatsIn("Europees Parlement", key),
    poll: seatsIn(pollName, key, polls),
  };
}

export interface HistoryPoint {
  year: number;
  date: string;
  seats: number;
  totalSeats: number;
}

// Seats won at every election since 1946, oldest first, with 0 for the
// elections the party did not win seats at
export function getPartyHistory(key: string): HistoryPoint[] {
  return [...pastElections]
    .sort((a, b) => a.updateDate.localeCompare(b.updateDate))
    .map((election) => ({
      year: Number(election.updateDate.slice(0, 4)),
      date: election.updateDate,
      seats: election.parties
        .filter((party) => getPartyKey(party.id) === key)
        .reduce((acc, party) => acc + party.seats, 0),
      totalSeats: election.parties.reduce((acc, party) => acc + party.seats, 0),
    }));
}

export interface CabinetPeriod {
  // e.g. "Rutte I"
  name: string;
  // From the election that led to the cabinet to the next election, which
  // is left out for the latest one
  from: string;
  to?: string;
  // Gedoogsteun instead of being in the cabinet
  isSupport: boolean;
}

// The cabinets the party was in or supported, from the coalitions of the
// past elections, oldest first
export function getCabinetPeriods(key: string): CabinetPeriod[] {
  const elections = [...pastElections].sort((a, b) =>
    a.updateDate.localeCompare(b.updateDate),
  );
  return elections.flatMap((election, index) => {
    const parties = election.parties.filter(
      (party) => getPartyKey(party.id) === key,
    );
    const isMember = parties.some((party) =>
      election.coalition?.includes(party.id),
    );
    const isSupport = parties.some((party) => party.isSupport);
    if (!isMember && !isSupport) return [];
    return [
      {
        // "2010 (Rutte I)" is the cabinet Rutte I
        name: election.name.match(/\((.*)\)/)?.[1] ?? election.name,
        from: election.updateDate,
        to: elections[index + 1]?.updateDate,
        isSupport: !isMember,
      },
    ];
  });
}
