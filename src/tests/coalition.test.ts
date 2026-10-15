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
import { describe, expect, test } from "vitest";
import { pastElections } from "@/data/pastElections";
import {
  getCoalitionLabel,
  getCoalitionParties,
  getSupportParties,
  withoutSupport,
} from "@/utils/coalition";

describe("past election coalitions", () => {
  test("every past election has a coalition made of its own parties", () => {
    for (const election of pastElections) {
      expect(election.coalition?.length, election.name).toBeGreaterThan(0);
      const ids = new Set(election.parties.map((p) => p.id));
      for (const id of election.coalition ?? []) {
        expect(ids.has(id), `${election.name}: ${id}`).toBe(true);
      }
      expect(getCoalitionParties(election)).toHaveLength(
        election.coalition?.length ?? 0,
      );
    }
  });

  test("names are unique and look like '<year> (<cabinet>)'", () => {
    const names = pastElections.map((e) => e.name);
    expect(new Set(names).size).toBe(names.length);
    for (const e of pastElections) {
      expect(e.name).toMatch(/^\d{4} \(.+\)$/);
      expect(e.name.slice(0, 4)).toBe(e.updateDate.slice(0, 4));
    }
  });

  test("lists the coalition parties, largest first", () => {
    const e = pastElections.find((p) => p.name.startsWith("2006"));
    expect(getCoalitionLabel(e)).toBe("CDA, PvdA, CU");
  });

  test("shows gedoogsteun only once the coalition is picked", () => {
    const rutte = pastElections.find((p) => p.name.startsWith("2010"))!;
    expect(getSupportParties(rutte.parties).map((p) => p.shortName)).toEqual([
      "PVV",
    ]);
    const shown = withoutSupport(rutte.parties);
    expect(getSupportParties(shown)).toEqual([]);
    expect(shown.map((p) => p.seats)).toEqual(
      rutte.parties.map((p) => p.seats),
    );
    // The preset itself keeps its gedoogsteun
    expect(getSupportParties(rutte.parties)).toHaveLength(1);
  });

  test("presets without a coalition give nothing", () => {
    expect(getCoalitionParties(undefined)).toEqual([]);
    expect(getCoalitionLabel({ parties: [] })).toBe("");
  });
});
