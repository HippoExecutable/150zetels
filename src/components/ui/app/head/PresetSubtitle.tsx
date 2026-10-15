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

import { getCoalitionLabel, getSupportParties } from "@/utils/coalition";
import { useI18n } from "@/lib/zustandStore";
import { Preset } from "@/types";

// The small line under a preset's name: its coalition (past elections and current rooms),
// or otherwise its date
export default function PresetSubtitle({
  preset,
  dateLabelKey,
}: {
  preset: Preset;
  dateLabelKey: string;
}) {
  const { i } = useI18n();
  const coalition = getCoalitionLabel(preset);
  const support = getSupportParties(preset.parties)
    .map((party) => party.shortName)
    .join(", ");

  return (
    <p className="text-xs opacity-75">
      {coalition
        ? `${i("body.coalition")}: ${coalition}${
            support ? ` (${i("support.label").toLowerCase()}: ${support})` : ""
          }`
        : `${i(dateLabelKey)}: ${new Date(preset.updateDate).toLocaleDateString(
            i("locale"),
            { timeZone: "UTC" },
          )}`}
    </p>
  );
}
