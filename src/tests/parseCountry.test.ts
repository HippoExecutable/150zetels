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
import { parseCountry, stringifyCountry } from "@/utils/parseCountry";
import { CountryData, Party } from "@/types";

const partyA: Party = {
  id: "a",
  name: "Alpha Party",
  shortName: "Alpha",
  seats: 20,
  colour: "#ff0000",
  position: -2,
  isIndependent: false,
};

const partyB: Party = {
  id: "b",
  name: "Beta Party",
  shortName: "Beta",
  seats: 15,
  colour: "#0000ff",
  position: 3,
};

const country: CountryData = {
  name: "Alphaland",
  updateDate: "2026-10-10",
  parties: [partyA, partyB],
  selectedParties: [partyB],
};

const emptyCountry: CountryData = {
  name: "",
  updateDate: "",
  parties: [],
  selectedParties: [],
};

test("round-trips exported countries", () => {
  expect(parseCountry(stringifyCountry(country))).toEqual(country);
  expect(
    parseCountry(stringifyCountry({ ...country, selectedParties: [] })),
  ).toEqual({ ...country, selectedParties: [] });
  expect(parseCountry(stringifyCountry(emptyCountry))).toEqual(emptyCountry);
});

test("exports the selected parties as ids", () => {
  expect(JSON.parse(stringifyCountry(country)).selectedPartyIds).toEqual(["b"]);
});

test("leaves the ids out when every party is selected", () => {
  const allSelected = { ...country, selectedParties: [partyB, partyA] };

  expect(JSON.parse(stringifyCountry(allSelected))).not.toHaveProperty(
    "selectedPartyIds",
  );
  expect(parseCountry(stringifyCountry(allSelected))?.selectedParties).toEqual([
    partyA,
    partyB,
  ]);
});

test("ignores selected ids that match no party", () => {
  expect(
    parseCountry(
      JSON.stringify({
        parties: [partyA, partyB],
        selectedPartyIds: ["b", "missing"],
      }),
    )?.selectedParties,
  ).toEqual([partyB]);
});

test("round-trips the majority threshold and tie breaker", () => {
  const twoThirds = {
    ...country,
    majorityThreshold: { numerator: 2, denominator: 3 },
    allowTieBreaker: false,
  };
  const customHalf = {
    ...country,
    majorityThreshold: { numerator: 5000, denominator: 10000 },
    allowTieBreaker: true,
  };

  expect(parseCountry(stringifyCountry(twoThirds))).toEqual(twoThirds);
  expect(parseCountry(stringifyCountry(customHalf))).toEqual(customHalf);
});

test("leaves the majority settings out when they are not included", () => {
  const exported = JSON.parse(stringifyCountry(country));

  expect(exported).not.toHaveProperty("majorityThreshold");
  expect(exported).not.toHaveProperty("allowTieBreaker");
  expect(
    parseCountry(stringifyCountry(country))?.majorityThreshold,
  ).toBeUndefined();
});

test("returns null for invalid majority settings", () => {
  const withThreshold = (numerator: unknown, denominator: unknown) =>
    JSON.stringify({
      ...country,
      majorityThreshold: { numerator, denominator },
    });

  expect(parseCountry(withThreshold(0, 2))).toBeNull();
  expect(parseCountry(withThreshold(3, 2))).toBeNull();
  expect(parseCountry(withThreshold(1.5, 2))).toBeNull();
  expect(parseCountry(withThreshold(1, 20000))).toBeNull();
  expect(parseCountry(withThreshold("1", "2"))).toBeNull();
  expect(
    parseCountry(JSON.stringify({ ...country, majorityThreshold: 0.5 })),
  ).toBeNull();
  expect(
    parseCountry(JSON.stringify({ ...country, allowTieBreaker: "yes" })),
  ).toBeNull();
});

test("round-trips the sort order and language", () => {
  const withSettings: CountryData = {
    ...country,
    sortBy: "position",
    locale: "nl",
  };

  expect(parseCountry(stringifyCountry(withSettings))).toEqual(withSettings);
  expect(JSON.parse(stringifyCountry(country))).not.toHaveProperty("sortBy");
  expect(JSON.parse(stringifyCountry(country))).not.toHaveProperty("locale");
});

test("returns null for unknown sort orders and languages", () => {
  expect(
    parseCountry(JSON.stringify({ ...country, sortBy: "colour" })),
  ).toBeNull();
  expect(parseCountry(JSON.stringify({ ...country, locale: "xx" }))).toBeNull();
  expect(parseCountry(JSON.stringify({ ...country, locale: 1 }))).toBeNull();
});

test("accepts older exports that are only a list of parties", () => {
  expect(parseCountry(JSON.stringify([partyA, partyB], null, 2))).toEqual({
    name: "",
    updateDate: "",
    parties: [partyA, partyB],
    selectedParties: [partyA, partyB],
  });
  expect(parseCountry("[]")).toEqual(emptyCountry);
});

test("fills in a missing name, update date, and selection", () => {
  expect(parseCountry(JSON.stringify({ parties: [partyA] }))).toEqual({
    name: "",
    updateDate: "",
    parties: [partyA],
    selectedParties: [partyA],
  });
});

test("accepts compact and pasted whitespace", () => {
  expect(parseCountry(stringifyCountry(country, 0))).toEqual(country);
  expect(parseCountry(`\n  ${stringifyCountry(country)}  \n`)).toEqual(country);
});

test("returns null for JSON that is not a country or a list of parties", () => {
  expect(parseCountry("{}")).toBeNull();
  expect(parseCountry("null")).toBeNull();
  expect(parseCountry('"Alpha Party"')).toBeNull();
  expect(parseCountry(JSON.stringify(partyA))).toBeNull();
  expect(parseCountry(JSON.stringify([partyA, null]))).toBeNull();
  expect(parseCountry(JSON.stringify([{ ...partyA, seats: "20" }]))).toBeNull();
  expect(
    parseCountry(JSON.stringify([{ ...partyA, isIndependent: "no" }])),
  ).toBeNull();
  expect(
    parseCountry(JSON.stringify({ ...country, parties: [partyA, null] })),
  ).toBeNull();
  expect(parseCountry(JSON.stringify({ ...country, name: 1 }))).toBeNull();
  expect(
    parseCountry(JSON.stringify({ parties: [partyA], selectedPartyIds: "a" })),
  ).toBeNull();
  expect(
    parseCountry(JSON.stringify({ parties: [partyA], selectedPartyIds: [1] })),
  ).toBeNull();
});

test("returns null for update dates that are not YYYY-MM-DD", () => {
  expect(
    parseCountry(JSON.stringify({ ...country, updateDate: "10/10/2026" })),
  ).toBeNull();
  expect(
    parseCountry(JSON.stringify({ ...country, updateDate: "yesterday" })),
  ).toBeNull();
  expect(
    parseCountry(JSON.stringify({ ...country, updateDate: 20261010 })),
  ).toBeNull();
});

test("throws for text that is not JSON", () => {
  expect(() => parseCountry("")).toThrow();
  expect(() => parseCountry("[{")).toThrow();
  expect(() => parseCountry("Alpha Party")).toThrow();
});
