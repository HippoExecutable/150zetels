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
import {
  createShareLink,
  decodeShareData,
  encodeShareData,
  getShareData,
} from "@/utils/shareLink";
import { countries } from "@/data/countries";
import { CountryData, Party } from "@/types";

const partyA: Party = {
  id: "a",
  name: "Bündnis 90/Die Grünen",
  shortName: "Grüne",
  seats: 20,
  colour: "#ff0000",
  position: -2,
  isIndependent: false,
};

const partyB: Party = {
  id: "b",
  name: "Christen-Democratisch Appèl",
  shortName: "CDA",
  seats: 15,
  colour: "#0000ff",
  position: 3,
};

const country: CountryData = {
  name: "Ostfriesland 🌊",
  updateDate: "2026-10-10",
  parties: [partyA, partyB],
  selectedParties: [partyA],
};

const emptyCountry: CountryData = {
  name: "",
  updateDate: "",
  parties: [],
  selectedParties: [],
};

test("round-trips countries, including non-ASCII names", async () => {
  const data = await encodeShareData(country);

  expect(data).toMatch(/^[A-Za-z0-9_-]+$/);
  expect(await decodeShareData(data)).toEqual(country);
  expect(await decodeShareData(await encodeShareData(emptyCountry))).toEqual(
    emptyCountry,
  );
});

test("keeps links for every country reasonably short", async () => {
  for (const { name, updateDate, parties } of countries) {
    const sampleCountry = {
      name,
      updateDate,
      parties,
      selectedParties: parties,
    };
    const link = await createShareLink(sampleCountry, "https://example.com/");

    expect(link.length).toBeLessThan(2000);
    expect(await decodeShareData(getShareData(new URL(link).hash)!)).toEqual(
      sampleCountry,
    );
  }
});

test("puts the data in the hash and drops other query params", async () => {
  const link = new URL(
    await createShareLink(
      country,
      "https://example.com/app/?country=Germany&lang=de#old",
    ),
  );

  expect(link.origin + link.pathname).toBe("https://example.com/app/");
  expect(link.search).toBe("");
  expect(getShareData(link.hash)).not.toBeNull();
});

test("reads the data from a hash", () => {
  expect(getShareData("#data=abc")).toBe("abc");
  expect(getShareData("data=abc")).toBe("abc");
  expect(getShareData("")).toBeNull();
  expect(getShareData("#other=abc")).toBeNull();
});

test("returns null for damaged or invalid data", async () => {
  const data = await encodeShareData(country);

  expect(await decodeShareData("")).toBeNull();
  expect(await decodeShareData("not base64!")).toBeNull();
  expect(await decodeShareData(data.slice(0, -4))).toBeNull();
  // Uncompressed JSON is not a valid share link
  expect(
    await decodeShareData(btoa(JSON.stringify(country.parties))),
  ).toBeNull();
  expect(
    await decodeShareData(
      await encodeShareData({
        ...country,
        parties: [{ ...partyA, seats: "20" }],
      } as unknown as CountryData),
    ),
  ).toBeNull();
});
