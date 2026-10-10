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

import { Party } from "@/types";

export function stringifyParties(parties: Party[]) {
  return JSON.stringify(parties, null, 2);
}

// Throws when the data is not JSON, and returns null when it is not a list of parties
export function parseParties(data: string) {
  const parsedData: unknown = JSON.parse(data);

  const isValid =
    Array.isArray(parsedData) &&
    parsedData.every(
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
    );

  return isValid ? parsedData : null;
}
