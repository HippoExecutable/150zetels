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

import { useSelectedPreset } from "@/lib/zustandStore";

// Plain text; line breaks in the description are kept
export function PresetDescriptionText({
  description,
}: {
  description?: string;
}) {
  if (!description) return null;

  return (
    <p className="mt-4 rounded-2xl border-2 border-zinc-200 p-3 text-sm whitespace-pre-line dark:border-zinc-700">
      {description}
    </p>
  );
}

// The `description` of the selected preset (e.g. a poll), shown above the chart
export default function PresetDescription() {
  const { selectedPreset } = useSelectedPreset();

  return <PresetDescriptionText description={selectedPreset?.description} />;
}
