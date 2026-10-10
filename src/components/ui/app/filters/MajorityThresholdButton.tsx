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
  useAllowTieBreaker,
  useMajorityThreshold,
  useParties,
  useI18n,
} from "@/lib/zustandStore";
import { MajorityThreshold } from "@/types";
import { getMajority, isSameThreshold } from "@/utils/getMajority";
import { pluralize } from "@/utils/pluralize";
import { ChevronDownIcon, ScaleIcon } from "@heroicons/react/16/solid";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import AllowTieBreakerButton from "./AllowTieBreakerButton";

export default function MajorityThresholdButton() {
  const { majorityThreshold, setMajorityThreshold } = useMajorityThreshold();
  const { allowTieBreaker } = useAllowTieBreaker();
  const { parties } = useParties();
  const { i } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [customPercent, setCustomPercent] = useState("");
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      // Keeps focus inside for onBlur, without scrolling the page to the dropdown
      dropdownRef.current.focus({ preventScroll: true });
    }
  }, [isOpen]);

  const total = parties.reduce((acc, party) => acc + party.seats, 0);
  const thresholdConfigs = [
    {
      id: "blockingMinority",
      label: i("majority.blockingMinority"),
      threshold: { numerator: 1, denominator: 3 },
    },
    {
      id: "simple",
      label: i("majority.simple"),
      threshold: { numerator: 1, denominator: 2 },
    },
    {
      id: "threeFifths",
      label: i("majority.threeFifths"),
      threshold: { numerator: 3, denominator: 5 },
    },
    {
      id: "twoThirds",
      label: i("majority.twoThirds"),
      threshold: { numerator: 2, denominator: 3 },
    },
    {
      id: "threeQuarters",
      label: i("majority.threeQuarters"),
      threshold: { numerator: 3, denominator: 4 },
    },
  ] as {
    id: string;
    label: string;
    threshold: MajorityThreshold;
  }[];

  const selectedConfig = thresholdConfigs.find((config) =>
    isSameThreshold(config.threshold, majorityThreshold),
  );
  const percent = Number(
    (
      (majorityThreshold.numerator / majorityThreshold.denominator) *
      100
    ).toFixed(2),
  );

  return (
    <div className="flex-1">
      <div
        className="relative w-fit"
        tabIndex={-1}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsOpen(false);
          }
        }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1 rounded-full border-2 border-transparent py-0.75 ps-2.5 pe-1.5 text-sm tabular-nums transition-colors duration-300 ${
            isOpen
              ? "bg-zinc-700 text-white dark:bg-zinc-200 dark:text-zinc-950"
              : "bg-zinc-200 dark:bg-zinc-700"
          }`}
          type="button"
          title={i("body.majorityThreshold")}
          aria-label={i("body.majorityThreshold")}
          aria-expanded={isOpen}
        >
          <ScaleIcon className="size-4 shrink-0" />
          <span className="font-semibold">
            {selectedConfig
              ? `${selectedConfig.threshold.numerator}/${selectedConfig.threshold.denominator}`
              : `${percent}%`}
          </span>
          <ChevronDownIcon
            className={`size-4 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                key="modal"
                transition={{
                  duration: 0.3,
                }}
                initial={{ opacity: 0, translateY: -8 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: -2 }}
                ref={dropdownRef}
                tabIndex={-1}
                className="absolute top-full z-100 mt-2 w-64 overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white shadow-xl outline-hidden dark:border-zinc-700 dark:bg-zinc-900"
              >
                <ul>
                  <li>
                    <span className="px-2 py-1 text-sm opacity-75">
                      {i("body.majorityThreshold")}
                    </span>
                    <ul>
                      {thresholdConfigs.map((config) => (
                        <li
                          key={config.id}
                          className={`transition-colors duration-300 ${
                            selectedConfig?.id === config.id
                              ? "bg-zinc-200 dark:bg-zinc-700"
                              : "hover:bg-zinc-200 dark:hover:bg-zinc-700"
                          }`}
                        >
                          <button
                            onClick={() => {
                              setMajorityThreshold(config.threshold);
                              setCustomPercent("");
                              setIsOpen(false);
                            }}
                            className="flex w-full items-center justify-between gap-2 p-2 text-start"
                            type="button"
                          >
                            <div className="flex flex-col items-start">
                              <span>{config.label}</span>
                              {total > 0 && (
                                <p className="text-xs opacity-75">
                                  {pluralize(
                                    getMajority(
                                      total,
                                      0,
                                      allowTieBreaker,
                                      config.threshold,
                                    ).seatsForMajority,
                                    i("header.seat"),
                                    i("header.seats"),
                                  )}
                                </p>
                              )}
                            </div>
                            <span className="tabular-nums opacity-75">
                              {config.threshold.numerator}/
                              {config.threshold.denominator}
                            </span>
                          </button>
                          {
                            // Ties can only happen when the threshold is exactly one half
                            config.id === "simple" &&
                              selectedConfig?.id === "simple" && (
                                <div className="px-2 pb-2">
                                  <AllowTieBreakerButton />
                                </div>
                              )
                          }
                        </li>
                      ))}
                    </ul>
                  </li>
                  <li className="border-t-2 border-zinc-200 dark:border-zinc-700">
                    <label
                      className={`flex w-full items-center justify-between gap-2 p-2 transition-colors duration-300 ${
                        !selectedConfig ? "bg-zinc-200 dark:bg-zinc-700" : ""
                      }`}
                    >
                      <span>{i("header.custom")}</span>
                      <span className="flex items-center gap-1 tabular-nums">
                        <input
                          name="majorityThreshold"
                          type="number"
                          inputMode="decimal"
                          placeholder={percent.toString()}
                          className="w-16 border-b border-zinc-400 bg-transparent text-end outline-hidden dark:border-zinc-500"
                          min={1}
                          max={100}
                          step="any"
                          value={customPercent}
                          onChange={(e) => {
                            setCustomPercent(e.target.value);

                            // Stored out of 10000 so up to two decimals stay exact
                            const numerator = Math.round(
                              parseFloat(e.target.value) * 100,
                            );
                            if (numerator > 0 && numerator <= 10000) {
                              setMajorityThreshold({
                                numerator,
                                denominator: 10000,
                              });
                            }
                          }}
                        />
                        <span className="opacity-75">%</span>
                      </span>
                    </label>
                  </li>
                </ul>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
