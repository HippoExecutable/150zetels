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
import { getArcSegments, getImageFileName } from "@/utils/drawImage";
import { Party } from "@/types";

const party = (id: string, seats: number, colour: string): Party => ({
  id,
  name: id,
  shortName: id,
  seats,
  colour,
  position: 0,
});

test("half pie runs from the left end to the right end", () => {
  const segments = getArcSegments(
    [party("a", 30, "#f00"), party("b", 20, "#00f")],
    100,
    "grey",
  );

  expect(segments.map(({ colour }) => colour)).toEqual([
    "#f00",
    "#00f",
    "grey",
  ]);
  expect(segments[0].start).toBeCloseTo(Math.PI);
  expect(segments[0].end).toBeCloseTo(Math.PI * 1.3);
  expect(segments[1].end).toBeCloseTo(Math.PI * 1.5);
  expect(segments[2].end).toBeCloseTo(Math.PI * 2);
});

test("half pie leaves out empty segments", () => {
  expect(getArcSegments([party("a", 100, "#f00")], 100, "grey")).toHaveLength(
    1,
  );
  expect(getArcSegments([], 0, "grey")).toEqual([
    { colour: "grey", start: Math.PI, end: Math.PI * 2 },
  ]);
  expect(getArcSegments([party("a", 0, "#f00")], 10, "grey")).toHaveLength(1);
});

test("image file names come from the title", () => {
  expect(getImageFileName("Germany 🇩🇪", "square")).toBe("germany-square.png");
  expect(getImageFileName("Bündnis 90/Die Grünen", "wide")).toBe(
    "bündnis-90-die-grünen-wide.png",
  );
  expect(getImageFileName("", "vertical")).toBe(
    "parliament-seats-vertical.png",
  );
  expect(getImageFileName("🌊", "square")).toBe("parliament-seats-square.png");
});
