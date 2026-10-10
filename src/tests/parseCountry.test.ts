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
import { parseParties, stringifyParties } from "@/utils/parseParties";
import { Party } from "@/types";

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

test("round-trips exported parties", () => {
  expect(parseParties(stringifyParties([partyA, partyB]))).toEqual([
    partyA,
    partyB,
  ]);
  expect(parseParties(stringifyParties([]))).toEqual([]);
});

test("accepts compact and pasted whitespace", () => {
  expect(parseParties(JSON.stringify([partyA]))).toEqual([partyA]);
  expect(parseParties(`\n  ${stringifyParties([partyB])}  \n`)).toEqual([
    partyB,
  ]);
});

test("returns null for JSON that is not a list of parties", () => {
  expect(parseParties("{}")).toBeNull();
  expect(parseParties("null")).toBeNull();
  expect(parseParties('"Alpha Party"')).toBeNull();
  expect(parseParties(JSON.stringify(partyA))).toBeNull();
  expect(parseParties(JSON.stringify([partyA, null]))).toBeNull();
  expect(parseParties(JSON.stringify([{ ...partyA, seats: "20" }]))).toBeNull();
  expect(
    parseParties(JSON.stringify([{ ...partyA, isIndependent: "no" }])),
  ).toBeNull();
});

test("throws for text that is not JSON", () => {
  expect(() => parseParties("")).toThrow();
  expect(() => parseParties("[{")).toThrow();
  expect(() => parseParties("Alpha Party")).toThrow();
});
