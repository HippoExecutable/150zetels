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

import { useCustomInfo, useI18n, useSelectedPreset } from "@/lib/zustandStore";
import { PresetInfo } from "@/types";

export default function PresetInfoEditor() {
  const { selectedPreset, setSelectedPreset } = useSelectedPreset();
  const { customInfo, setCustomInfo } = useCustomInfo();
  const { i } = useI18n();
  const { name, updateDate } = selectedPreset ?? customInfo;

  // Editing a preset turns it into custom data
  const updateInfo = (info: Partial<PresetInfo>) => {
    setCustomInfo({ name, updateDate, ...info });
    setSelectedPreset(null);
  };

  return (
    <div className="mb-4 flex flex-wrap gap-4 rounded-2xl border-2 border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
      <label className="flex min-w-48 flex-1 flex-col gap-1">
        <span className="text-xs opacity-75">{i("body.presetName")}</span>
        <input
          name="presetName"
          type="text"
          placeholder={i("header.custom")}
          className="w-full border-b border-zinc-200 bg-transparent outline-hidden dark:border-zinc-700"
          value={name}
          onChange={(e) => updateInfo({ name: e.target.value })}
        />
      </label>
      <label className="flex min-w-48 flex-1 flex-col gap-1">
        <span className="text-xs opacity-75">{i("body.dataUpdatedAt")}</span>
        <input
          name="updateDate"
          type="date"
          className="w-full border-b border-zinc-200 bg-transparent outline-hidden dark:border-zinc-700 dark:scheme-dark"
          value={updateDate}
          onChange={(e) => updateInfo({ updateDate: e.target.value })}
        />
      </label>
    </div>
  );
}
