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

import { Country, Party } from "@/types";

function isParties(data: unknown): data is Party[] {
  return (
    Array.isArray(data) &&
    data.every(
      (item): item is Party =>
        typeof item === "object" &&
        item !== null &&
        typeof item.name === "string" &&
        typeof item.shortName === "string" &&
        typeof item.seats === "number" &&
        typeof item.colour === "string" &&
        typeof item.position === "number" &&
        (typeof item.isIndependent === "boolean" ||
          item.isIndependent === undefined),
    )
  );
}

export function stringifyCountry(
  { name, updateDate, parties }: Country,
  space = 2,
) {
  return JSON.stringify({ name, updateDate, parties }, null, space);
}

// Throws when the data is not JSON, and returns null when it is not a country or a list of parties
export function parseCountry(data: string): Country | null {
  const parsedData: unknown = JSON.parse(data);

  // Older exports are only a list of parties
  if (isParties(parsedData)) {
    return { name: "", updateDate: "", parties: parsedData };
  }

  if (typeof parsedData !== "object" || parsedData === null) return null;

  const {
    name = "",
    updateDate = "",
    parties,
  } = parsedData as Record<string, unknown>;

  const isValid =
    typeof name === "string" &&
    typeof updateDate === "string" &&
    (updateDate === "" || /^\d{4}-\d{2}-\d{2}$/.test(updateDate)) &&
    isParties(parties);

  return isValid ? { name, updateDate, parties } : null;
}
