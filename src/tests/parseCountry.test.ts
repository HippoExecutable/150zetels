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
import { Country, Party } from "@/types";

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

const country: Country = {
  name: "Alphaland",
  updateDate: "2026-10-10",
  parties: [partyA, partyB],
};

test("round-trips exported countries", () => {
  expect(parseCountry(stringifyCountry(country))).toEqual(country);
  expect(
    parseCountry(stringifyCountry({ name: "", updateDate: "", parties: [] })),
  ).toEqual({ name: "", updateDate: "", parties: [] });
});

test("leaves the emoji out of exports", () => {
  expect(parseCountry(stringifyCountry({ ...country, emoji: "🏳️" }))).toEqual(
    country,
  );
});

test("accepts older exports that are only a list of parties", () => {
  expect(parseCountry(JSON.stringify([partyA, partyB], null, 2))).toEqual({
    name: "",
    updateDate: "",
    parties: [partyA, partyB],
  });
  expect(parseCountry("[]")).toEqual({
    name: "",
    updateDate: "",
    parties: [],
  });
});

test("fills in a missing name and update date", () => {
  expect(parseCountry(JSON.stringify({ parties: [partyA] }))).toEqual({
    name: "",
    updateDate: "",
    parties: [partyA],
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
