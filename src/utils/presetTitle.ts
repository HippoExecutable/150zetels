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

import { pastElections } from "@/data/pastElections";
import { Preset, PresetInfo } from "@/types";

// The name and date line shown above a chart
export function getPresetTitle(
  selectedPreset: Preset | null,
  customInfo: PresetInfo,
  i: (key: string) => string,
) {
  const { name, updateDate } = selectedPreset ?? customInfo;
  const title = [name, selectedPreset?.emoji].filter(Boolean).join(" ");
  const isPastElection = pastElections.some((c) => c.name === name);
  const dateLabel = isPastElection
    ? i("body.electionDate")
    : selectedPreset
      ? i("body.pollUpdatedAt")
      : i("body.dataUpdatedAt");
  const subtitle = updateDate
    ? `${dateLabel}: ${new Date(updateDate).toLocaleDateString(i("locale"), {
        timeZone: "UTC",
      })}`
    : "";

  return { title, subtitle };
}
