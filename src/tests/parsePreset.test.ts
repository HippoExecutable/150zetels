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
import { parsePreset, stringifyPreset } from "@/utils/parsePreset";
import { PresetData, Party } from "@/types";

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

const preset: PresetData = {
  name: "Alphaland",
  updateDate: "2026-10-10",
  parties: [partyA, partyB],
  selectedParties: [partyB],
};

const emptyPreset: PresetData = {
  name: "",
  updateDate: "",
  parties: [],
  selectedParties: [],
};

test("round-trips exported presets", () => {
  expect(parsePreset(stringifyPreset(preset))).toEqual(preset);
  expect(
    parsePreset(stringifyPreset({ ...preset, selectedParties: [] })),
  ).toEqual({ ...preset, selectedParties: [] });
  expect(parsePreset(stringifyPreset(emptyPreset))).toEqual(emptyPreset);
});

test("round-trips party votes", () => {
  const withVotes = {
    ...preset,
    parties: [
      { ...partyA, votes: 120000 },
      { ...partyB, votes: 14.5, isThresholdExempt: true },
    ],
    selectedParties: [{ ...partyB, votes: 14.5, isThresholdExempt: true }],
  };

  expect(parsePreset(stringifyPreset(withVotes))).toEqual(withVotes);
});

test("exports the selected parties as ids", () => {
  expect(JSON.parse(stringifyPreset(preset)).selectedPartyIds).toEqual(["b"]);
});

test("leaves the ids out when every party is selected", () => {
  const allSelected = { ...preset, selectedParties: [partyB, partyA] };

  expect(JSON.parse(stringifyPreset(allSelected))).not.toHaveProperty(
    "selectedPartyIds",
  );
  expect(parsePreset(stringifyPreset(allSelected))?.selectedParties).toEqual([
    partyA,
    partyB,
  ]);
});

test("ignores selected ids that match no party", () => {
  expect(
    parsePreset(
      JSON.stringify({
        parties: [partyA, partyB],
        selectedPartyIds: ["b", "missing"],
      }),
    )?.selectedParties,
  ).toEqual([partyB]);
});

test("round-trips the majority threshold and tie breaker", () => {
  const twoThirds = {
    ...preset,
    majorityThreshold: { numerator: 2, denominator: 3 },
    allowTieBreaker: false,
  };
  const customHalf = {
    ...preset,
    majorityThreshold: { numerator: 5000, denominator: 10000 },
    allowTieBreaker: true,
  };

  expect(parsePreset(stringifyPreset(twoThirds))).toEqual(twoThirds);
  expect(parsePreset(stringifyPreset(customHalf))).toEqual(customHalf);
});

test("leaves the majority settings out when they are not included", () => {
  const exported = JSON.parse(stringifyPreset(preset));

  expect(exported).not.toHaveProperty("majorityThreshold");
  expect(exported).not.toHaveProperty("allowTieBreaker");
  expect(
    parsePreset(stringifyPreset(preset))?.majorityThreshold,
  ).toBeUndefined();
});

test("returns null for invalid majority settings", () => {
  const withThreshold = (numerator: unknown, denominator: unknown) =>
    JSON.stringify({
      ...preset,
      majorityThreshold: { numerator, denominator },
    });

  expect(parsePreset(withThreshold(0, 2))).toBeNull();
  expect(parsePreset(withThreshold(3, 2))).toBeNull();
  expect(parsePreset(withThreshold(1.5, 2))).toBeNull();
  expect(parsePreset(withThreshold(1, 20000))).toBeNull();
  expect(parsePreset(withThreshold("1", "2"))).toBeNull();
  expect(
    parsePreset(JSON.stringify({ ...preset, majorityThreshold: 0.5 })),
  ).toBeNull();
  expect(
    parsePreset(JSON.stringify({ ...preset, allowTieBreaker: "yes" })),
  ).toBeNull();
});

test("round-trips the sort order and language", () => {
  const withSettings: PresetData = {
    ...preset,
    sortBy: "position",
    locale: "nl",
  };

  expect(parsePreset(stringifyPreset(withSettings))).toEqual(withSettings);
  expect(JSON.parse(stringifyPreset(preset))).not.toHaveProperty("sortBy");
  expect(JSON.parse(stringifyPreset(preset))).not.toHaveProperty("locale");
});

test("returns null for unknown sort orders and languages", () => {
  expect(
    parsePreset(JSON.stringify({ ...preset, sortBy: "colour" })),
  ).toBeNull();
  expect(parsePreset(JSON.stringify({ ...preset, locale: "xx" }))).toBeNull();
  expect(parsePreset(JSON.stringify({ ...preset, locale: 1 }))).toBeNull();
});

test("accepts older exports that are only a list of parties", () => {
  expect(parsePreset(JSON.stringify([partyA, partyB], null, 2))).toEqual({
    name: "",
    updateDate: "",
    parties: [partyA, partyB],
    selectedParties: [partyA, partyB],
  });
  expect(parsePreset("[]")).toEqual(emptyPreset);
});

test("fills in a missing name, update date, and selection", () => {
  expect(parsePreset(JSON.stringify({ parties: [partyA] }))).toEqual({
    name: "",
    updateDate: "",
    parties: [partyA],
    selectedParties: [partyA],
  });
});

test("accepts compact and pasted whitespace", () => {
  expect(parsePreset(stringifyPreset(preset, 0))).toEqual(preset);
  expect(parsePreset(`\n  ${stringifyPreset(preset)}  \n`)).toEqual(preset);
});

test("returns null for JSON that is not a preset or a list of parties", () => {
  expect(parsePreset("{}")).toBeNull();
  expect(parsePreset("null")).toBeNull();
  expect(parsePreset('"Alpha Party"')).toBeNull();
  expect(parsePreset(JSON.stringify(partyA))).toBeNull();
  expect(parsePreset(JSON.stringify([partyA, null]))).toBeNull();
  expect(parsePreset(JSON.stringify([{ ...partyA, seats: "20" }]))).toBeNull();
  expect(
    parsePreset(JSON.stringify([{ ...partyA, isIndependent: "no" }])),
  ).toBeNull();
  expect(
    parsePreset(JSON.stringify([{ ...partyA, votes: "12000" }])),
  ).toBeNull();
  expect(
    parsePreset(JSON.stringify([{ ...partyA, isThresholdExempt: 1 }])),
  ).toBeNull();
  expect(
    parsePreset(JSON.stringify({ ...preset, parties: [partyA, null] })),
  ).toBeNull();
  expect(parsePreset(JSON.stringify({ ...preset, name: 1 }))).toBeNull();
  expect(
    parsePreset(JSON.stringify({ parties: [partyA], selectedPartyIds: "a" })),
  ).toBeNull();
  expect(
    parsePreset(JSON.stringify({ parties: [partyA], selectedPartyIds: [1] })),
  ).toBeNull();
});

test("returns null for update dates that are not YYYY-MM-DD", () => {
  expect(
    parsePreset(JSON.stringify({ ...preset, updateDate: "10/10/2026" })),
  ).toBeNull();
  expect(
    parsePreset(JSON.stringify({ ...preset, updateDate: "yesterday" })),
  ).toBeNull();
  expect(
    parsePreset(JSON.stringify({ ...preset, updateDate: 20261010 })),
  ).toBeNull();
});

test("throws for text that is not JSON", () => {
  expect(() => parsePreset("")).toThrow();
  expect(() => parsePreset("[{")).toThrow();
  expect(() => parsePreset("Alpha Party")).toThrow();
});
