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

import { withoutSupport } from "@/utils/coalition";
import { currentRooms } from "@/data/currentRooms";
import { polls } from "@/data/polls";
import { pastElections } from "@/data/pastElections";
import { allPresets } from "@/data/allPresets";
import {
  useI18n,
  useSelectedPreset,
  useParties,
  useSelectedParties,
  useCustomInfo,
} from "@/lib/zustandStore";
import { Preset } from "@/types";
import CollapsibleSection from "./CollapsibleSection";
import PresetSubtitle from "./PresetSubtitle";

export default function PresetListSidebar() {
  const { i } = useI18n();
  const { selectedPreset, setSelectedPreset } = useSelectedPreset();
  const { setParties } = useParties();
  const { setSelectedParties } = useSelectedParties();
  const { customInfo, setCustomInfo } = useCustomInfo();

  function select(preset: Preset) {
    setSelectedPreset(preset);
    const findPreset = allPresets.find((c) => c.name === preset.name);
    if (findPreset) {
      const presetParties = withoutSupport(findPreset.parties);
      setParties(presetParties);
      setSelectedParties(presetParties);
    } else {
      setSelectedPreset(null);
      setParties([]);
      setSelectedParties([]);
    }
  }

  function renderPreset(preset: Preset, dateLabelKey: string) {
    return (
      <li key={preset.name} value={preset.name} id={preset.name}>
        <button
          onClick={() => select(preset)}
          className={`flex w-full flex-col items-start p-2 text-start transition-colors duration-300 ${
            selectedPreset === preset
              ? "bg-zinc-200 dark:bg-zinc-700"
              : "hover:bg-zinc-200 dark:hover:bg-zinc-700"
          }`}
        >
          <div className="line-clamp-1 flex gap-1">
            <span>{preset.name}</span>
            <span>{preset.emoji}</span>
          </div>
          <PresetSubtitle preset={preset} dateLabelKey={dateLabelKey} />
        </button>
      </li>
    );
  }

  return (
    <>
      <div className="sticky top-4 z-100 h-[80vh] w-full overflow-auto rounded-2xl border-2 border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="p-2 text-xl font-semibold">{i("header.presets")}</h2>
        <ul>
          <CollapsibleSection title={i("header.custom")}>
            <li>
              <button
                onClick={() => {
                  if (selectedPreset) {
                    setSelectedPreset(null);
                    setParties([]);
                    setSelectedParties([]);
                    setCustomInfo({ name: "", updateDate: "" });
                  }
                }}
                className={`flex w-full flex-col items-start p-2 text-start transition-colors duration-300 ${
                  !selectedPreset
                    ? "bg-zinc-200 dark:bg-zinc-700"
                    : "hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                <div className="line-clamp-1 flex gap-1">
                  <span>
                    {(!selectedPreset && customInfo.name) || i("header.custom")}
                  </span>
                </div>
                {!selectedPreset && customInfo.updateDate && (
                  <p className="text-xs opacity-75">
                    {i("body.dataUpdatedAt")}:{" "}
                    {new Date(customInfo.updateDate).toLocaleDateString(
                      i("locale"),
                      { timeZone: "UTC" },
                    )}
                  </p>
                )}
              </button>
            </li>
          </CollapsibleSection>
          <CollapsibleSection title={i("header.polls")}>
            {[...polls]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((preset) => renderPreset(preset, "body.pollUpdatedAt"))}
          </CollapsibleSection>
          <CollapsibleSection title={i("header.currentRooms")}>
            {currentRooms.map((preset) =>
              renderPreset(preset, "body.dataUpdatedAt"),
            )}
          </CollapsibleSection>
          <CollapsibleSection title={i("header.pastElections")}>
            {[...pastElections]
              .sort((a, b) => b.updateDate.localeCompare(a.updateDate))
              .map((preset) => renderPreset(preset, "body.electionDate"))}
          </CollapsibleSection>
        </ul>
      </div>
    </>
  );
}
