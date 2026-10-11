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
  createEmbedCode,
  createEmbedLink,
  createShareLink,
  decodeShareData,
  embedHeightMessage,
  encodeShareData,
  getShareData,
} from "@/utils/shareLink";
import { polls } from "@/data/polls";
import { PresetData, Party } from "@/types";

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

const preset: PresetData = {
  name: "Ostfriesland 🌊",
  updateDate: "2026-10-10",
  parties: [partyA, partyB],
  selectedParties: [partyA],
  majorityThreshold: { numerator: 2, denominator: 3 },
  allowTieBreaker: true,
  sortBy: "name",
  locale: "nl",
};

const emptyPreset: PresetData = {
  name: "",
  updateDate: "",
  parties: [],
  selectedParties: [],
};

test("round-trips presets, including non-ASCII names", async () => {
  const data = await encodeShareData(preset);

  expect(data).toMatch(/^[A-Za-z0-9_-]+$/);
  expect(await decodeShareData(data)).toEqual(preset);
  expect(await decodeShareData(await encodeShareData(emptyPreset))).toEqual(
    emptyPreset,
  );
});

test("keeps links for every preset reasonably short", async () => {
  for (const { name, updateDate, parties } of polls) {
    const samplePreset = {
      name,
      updateDate,
      parties,
      selectedParties: parties,
    };
    const link = await createShareLink(samplePreset, "https://example.com/");

    expect(link.length).toBeLessThan(2000);
    expect(await decodeShareData(getShareData(new URL(link).hash)!)).toEqual(
      samplePreset,
    );
  }
});

test("puts the data in the hash and drops other query params", async () => {
  const link = new URL(
    await createShareLink(
      preset,
      "https://example.com/app/?preset=Germany&lang=nl#old",
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
  const data = await encodeShareData(preset);

  expect(await decodeShareData("")).toBeNull();
  expect(await decodeShareData("not base64!")).toBeNull();
  expect(await decodeShareData(data.slice(0, -4))).toBeNull();
  // Uncompressed JSON is not a valid share link
  expect(
    await decodeShareData(btoa(JSON.stringify(preset.parties))),
  ).toBeNull();
  expect(
    await decodeShareData(
      await encodeShareData({
        ...preset,
        parties: [{ ...partyA, seats: "20" }],
      } as unknown as PresetData),
    ),
  ).toBeNull();
});

test("embed links open the embed view with the same data", async () => {
  const link = new URL(
    await createEmbedLink(preset, "https://example.com/app/?lang=nl"),
  );

  expect(link.origin + link.pathname).toBe("https://example.com/app/");
  expect(link.searchParams.has("embed")).toBe(true);
  expect(link.searchParams.has("lang")).toBe(false);
  expect(await decodeShareData(getShareData(link.hash)!)).toEqual(preset);
});

test("embed code has an iframe and a script that only trusts the app", async () => {
  const embedLink = await createEmbedLink(preset, "https://example.com/");
  const code = createEmbedCode(embedLink, preset);

  expect(code).toContain(`<iframe src="${embedLink}"`);
  expect(code).toContain('title="Ostfriesland 🌊 - Parliament Seats"');
  expect(code).toContain('e.origin!=="https://example.com"');
  expect(code).toContain(embedHeightMessage);
});

test("embed code escapes names that would break the HTML", async () => {
  const sneaky = { ...preset, name: `"><script>alert(1)</script>` };
  const code = createEmbedCode(
    await createEmbedLink(sneaky, "https://example.com/"),
    sneaky,
  );

  expect(code).not.toContain("<script>alert(1)");
  expect(code).toContain("&#34;&#62;&#60;script&#62;");
  expect(code.match(/<script>/g)).toHaveLength(1);
});

test("embed code starts taller for more parties", async () => {
  const height = (count: number) => {
    const parties = Array.from({ length: count }, (_, index) => ({
      ...partyA,
      id: index.toString(),
    }));
    const code = createEmbedCode("https://example.com/?embed", {
      ...emptyPreset,
      parties,
    });
    return Number(code.match(/height="(\d+)"/)![1]);
  };

  expect(height(3)).toBeLessThan(height(18));
});
