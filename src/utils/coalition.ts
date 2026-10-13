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

import { Party, Preset } from "@/types";

// The parties of the preset's coalition, largest first. Empty when it has none.
export function getCoalitionParties(
  preset: Pick<Preset, "parties" | "coalition"> | null | undefined,
): Party[] {
  if (!preset?.coalition) return [];
  const ids = new Set(preset.coalition);
  return preset.parties
    .filter((party) => ids.has(party.id))
    .sort((a, b) => b.seats - a.seats);
}

// e.g. "CDA, PvdA, CU", or "" when the preset has no coalition
export function getCoalitionLabel(
  preset: Pick<Preset, "parties" | "coalition"> | null | undefined,
): string {
  return getCoalitionParties(preset)
    .map((party) => party.shortName)
    .join(", ");
}
