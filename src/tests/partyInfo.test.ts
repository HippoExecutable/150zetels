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

import { expect, test } from "vitest";
import { currentRooms } from "@/data/currentRooms";
import { pastElections } from "@/data/pastElections";
import { polls } from "@/data/polls";
import {
  getCabinetPeriods,
  getCurrentSeats,
  getLatestElectionSeats,
  getPartyHistory,
  getPartyKey,
  getPartyInfo,
  getSuccessor,
  getWikipediaUrl,
  partyInfo,
  getParlementUrl,
} from "@/data/partyInfo";

test("matches parties across presets by the end of their id", () => {
  expect(getPartyKey("nl2025-pvv")).toBe("pvv");
  expect(getPartyKey("tk-pvv")).toBe("pvv");
  expect(getPartyKey("nl-ipsos-50plus")).toBe("50plus");
  expect(getPartyKey("nl2023-glpvda")).toBe("pro");
});

test("has info for every party in the presets", () => {
  for (const preset of [...pastElections, ...currentRooms, ...polls]) {
    for (const party of preset.parties) {
      expect(
        getPartyInfo(getPartyKey(party.id)),
        `${preset.name}: ${party.id}`,
      ).not.toBeNull();
    }
  }
});

test("only lists fusions of parties that have info", () => {
  for (const party of Object.values(partyInfo)) {
    for (const key of party.fusion?.parties ?? []) {
      expect(getPartyInfo(key), `${party.key}: ${key}`).not.toBeNull();
    }
  }
});

test("links split-off parties to the party they left", () => {
  expect(partyInfo.dna.split).toEqual({ year: 2026, from: "pvv" });
  for (const party of Object.values(partyInfo)) {
    if (party.split) {
      expect(getPartyInfo(party.split.from), party.key).not.toBeNull();
    }
  }
});

test("counts the seats of the GroenLinks-PvdA lists for PRO", () => {
  const history = getPartyHistory("pro");
  expect(history.find((p) => p.year === 2023)?.seats).toBe(25);
  expect(history.find((p) => p.year === 2021)?.seats).toBe(0);
  expect(getPartyHistory("pvda").find((p) => p.year === 2021)?.seats).toBe(9);
});

test("knows the House had 100 seats until 1956", () => {
  const history = getPartyHistory("kvp");
  expect(history[0]).toMatchObject({ year: 1946, seats: 32, totalSeats: 100 });
  expect(history.find((p) => p.year === 1956)?.totalSeats).toBe(150);
});

test("finds current seats in the rooms and the Ipsos poll", () => {
  const seats = getCurrentSeats("d66");
  expect(seats.tweedeKamer).toBe(26);
  expect(seats.eersteKamer).toBe(7);
  expect(seats.europeesParlement).toBe(3);
  expect(seats.poll).toBeGreaterThan(0);
  expect(getCurrentSeats("pvv", "Maurice de Hond").poll).toBe(18);
  expect(getCurrentSeats("kvp").tweedeKamer).toBe(0);
});

test("links merged parties to the party they merged into", () => {
  expect(getSuccessor("gl")?.key).toBe("pro");
  expect(getSuccessor("kvp")?.key).toBe("cda");
  expect(getSuccessor("pvv")).toBeNull();
});

test("links to Wikipedia, or to a search without an article", () => {
  expect(getWikipediaUrl(partyInfo.sp)).toBe(
    "https://nl.wikipedia.org/wiki/Socialistische_Partij_(Nederland)",
  );
  expect(getWikipediaUrl(partyInfo.walenkamp)).toBe(
    "https://nl.wikipedia.org/w/index.php?search=Fractie-Walenkamp",
  );
});

test("links to parlement.com, or to a search without a page", () => {
  expect(getParlementUrl(partyInfo.d66)).toBe(
    "https://www.parlement.com/partij/d66-democraten-66",
  );
  expect(getParlementUrl(partyInfo.vandesanden)).toBe(
    "https://www.parlement.com/zoeken?q=Van%20de%20Sanden",
  );
});

test("finds the seats at the latest election", () => {
  expect(getLatestElectionSeats("pvv")).toEqual({ year: 2025, seats: 26 });
  expect(getLatestElectionSeats("pro")).toEqual({ year: 2025, seats: 20 });
  expect(getLatestElectionSeats("dna").seats).toBe(0);
});

test("finds the cabinets from the coalitions of past elections", () => {
  const pvv = getCabinetPeriods("pvv");
  expect(pvv.map((p) => [p.name, p.isSupport])).toEqual([
    ["Rutte I", true],
    ["Schoof", false],
  ]);
  expect(pvv[0]).toMatchObject({ from: "2010-06-09", to: "2012-09-12" });
  const d66 = getCabinetPeriods("d66");
  expect(d66[d66.length - 1]).toMatchObject({
    name: "Jetten I",
    to: undefined,
  });
  expect(getCabinetPeriods("pvdd")).toEqual([]);
});
