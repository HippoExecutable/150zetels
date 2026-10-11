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
import { renderToStaticMarkup } from "react-dom/server";
import { PresetDescriptionText } from "@/components/ui/app/head/PresetDescription";

test("renders nothing without a description", () => {
  expect(renderToStaticMarkup(<PresetDescriptionText />)).toBe("");
  expect(renderToStaticMarkup(<PresetDescriptionText description="" />)).toBe(
    "",
  );
});

test("renders the description as text, keeping line breaks", () => {
  const html = renderToStaticMarkup(
    <PresetDescriptionText description={"Line one\n<b>Line two</b>"} />,
  );
  expect(html).toContain("whitespace-pre-line");
  expect(html).toContain("Line one\n&lt;b&gt;Line two&lt;/b&gt;");
});
