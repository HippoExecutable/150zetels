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

import {
  useSelectedParties,
  useParties,
  useSelectedPreset,
  useI18n,
  useCustomInfo,
} from "@/lib/zustandStore";
import { polls } from "@/data/polls";
import { pastElections } from "@/data/pastElections";
import { allPresets } from "@/data/allPresets";
import CollapsibleSection from "./CollapsibleSection";
import { useEffect, useRef, useState } from "react";
import { Preset } from "@/types";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

export default function PresetListDropdown() {
  const { selectedPreset, setSelectedPreset } = useSelectedPreset();
  const { setParties } = useParties();
  const { setSelectedParties } = useSelectedParties();
  const { customInfo, setCustomInfo } = useCustomInfo();
  const { i } = useI18n();
  const [openPresetList, setOpenPresetList] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});

  useEffect(() => {
    if (openPresetList && dropdownRef.current) {
      dropdownRef.current.focus();
    }
  }, [openPresetList]);

  function select(preset: Preset) {
    setSelectedPreset(preset);
    const findPreset = allPresets.find((c) => c.name === preset.name);
    if (findPreset) {
      setParties(findPreset.parties);
      setSelectedParties(findPreset.parties);
    } else {
      setSelectedPreset(null);
      setParties([]);
      setSelectedParties([]);
    }
    setOpenPresetList(false);
  }

  useEffect(() => {
    if (
      openPresetList &&
      selectedPreset &&
      itemRefs.current[selectedPreset.name]
    ) {
      const itemRef = itemRefs.current[selectedPreset.name];
      if (itemRef) {
        itemRef.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [openPresetList, selectedPreset]);

  return (
    <div
      tabIndex={0}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setOpenPresetList(false);
        }
      }}
    >
      <button
        onClick={() => {
          setOpenPresetList(!openPresetList);
        }}
        className={`w-full rounded-2xl border-2 border-zinc-200 p-2 pe-1 transition-colors duration-300 dark:border-zinc-700 ${
          openPresetList
            ? "bg-zinc-200 dark:bg-zinc-700"
            : "bg-white dark:bg-zinc-900"
        }`}
      >
        <div className="flex items-center justify-between gap-1">
          {selectedPreset ? (
            <div className="flex flex-col items-start gap-0 text-start">
              <div className="flex gap-1">
                <span>{selectedPreset.name}</span>
                <span>{selectedPreset.emoji}</span>
              </div>
              <p className="text-xs opacity-75">
                {i("body.pollUpdatedAt")}:{" "}
                {new Date(selectedPreset.updateDate).toLocaleDateString(
                  i("locale"),
                  { timeZone: "UTC" },
                )}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-start gap-0 text-start">
              <span>{customInfo.name || i("header.custom")}</span>
              {customInfo.updateDate && (
                <p className="text-xs opacity-75">
                  {i("body.dataUpdatedAt")}:{" "}
                  {new Date(customInfo.updateDate).toLocaleDateString(
                    i("locale"),
                    { timeZone: "UTC" },
                  )}
                </p>
              )}
            </div>
          )}
          <ChevronDownIcon
            className={`size-5 transition-transform duration-300 ${openPresetList ? "rotate-180" : ""}`}
          />
        </div>
      </button>
      <div className="relative">
        <AnimatePresence>
          {openPresetList && (
            <>
              <motion.div
                key="modal"
                transition={{
                  duration: 0.3,
                }}
                initial={{ opacity: 0, translateY: -8 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: -2 }}
                className="absolute top-0 z-75 max-h-[50vh] w-full overflow-auto rounded-2xl border-2 border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
                ref={dropdownRef}
              >
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
                          setOpenPresetList(false);
                        }}
                        className={`flex w-full flex-col items-start p-2 text-start transition-colors duration-300 ${
                          !selectedPreset
                            ? "bg-zinc-200 dark:bg-zinc-700"
                            : "hover:bg-zinc-200 dark:hover:bg-zinc-700"
                        }`}
                      >
                        <div className="flex gap-1">
                          <span>
                            {(!selectedPreset && customInfo.name) ||
                              i("header.custom")}
                          </span>
                        </div>
                        {!selectedPreset && customInfo.updateDate && (
                          <p className="text-xs opacity-75">
                            {i("body.dataUpdatedAt")}:{" "}
                            {new Date(customInfo.updateDate).toLocaleDateString(
                              i("locale"),
                              {
                                timeZone: "UTC",
                              },
                            )}
                          </p>
                        )}
                      </button>
                    </li>
                  </CollapsibleSection>
                  <CollapsibleSection title={i("header.polls")}>
                    {[...polls]
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((preset) => (
                        <li
                          key={preset.name}
                          value={preset.name}
                          id={preset.name}
                          ref={(el) => {
                            if (el) itemRefs.current[preset.name] = el;
                          }}
                        >
                          <button
                            onClick={() => {
                              select(preset);
                            }}
                            className={`flex w-full flex-col items-start p-2 text-start transition-colors duration-300 ${
                              selectedPreset === preset
                                ? "bg-zinc-200 dark:bg-zinc-700"
                                : "hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            }`}
                          >
                            <div className="flex gap-1">
                              <span>{preset.name}</span>
                              <span>{preset.emoji}</span>
                            </div>
                            {/* {selectedPreset === preset && ( */}
                            <p className="text-xs opacity-75">
                              {i("body.pollUpdatedAt")}:{" "}
                              {new Date(preset.updateDate).toLocaleDateString(
                                i("locale"),
                                {
                                  timeZone: "UTC",
                                },
                              )}
                            </p>
                            {/* )} */}
                          </button>
                        </li>
                      ))}
                  </CollapsibleSection>
                  <CollapsibleSection title={i("header.pastElections")}>
                    {[...pastElections]
                      .sort((a, b) => b.updateDate.localeCompare(a.updateDate))
                      .map((preset) => (
                        <li
                          key={preset.name}
                          value={preset.name}
                          id={preset.name}
                          ref={(el) => {
                            if (el) itemRefs.current[preset.name] = el;
                          }}
                        >
                          <button
                            onClick={() => {
                              select(preset);
                            }}
                            className={`flex w-full flex-col items-start p-2 text-start transition-colors duration-300 ${
                              selectedPreset === preset
                                ? "bg-zinc-200 dark:bg-zinc-700"
                                : "hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            }`}
                          >
                            <div className="flex gap-1">
                              <span>{preset.name}</span>
                              <span>{preset.emoji}</span>
                            </div>
                            {/* {selectedPreset === preset && ( */}
                            <p className="text-xs opacity-75">
                              {i("body.electionDate")}:{" "}
                              {new Date(preset.updateDate).toLocaleDateString(
                                i("locale"),
                                {
                                  timeZone: "UTC",
                                },
                              )}
                            </p>
                            {/* )} */}
                          </button>
                        </li>
                      ))}
                  </CollapsibleSection>
                </ul>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
