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

import { useI18n, useParties, useSelectedParties } from "@/lib/zustandStore";
import { getPosition, spectrumStops } from "@/utils/getPosition";
import { pluralize } from "@/utils/pluralize";
import { CheckIcon } from "@heroicons/react/20/solid";
import { useState } from "react";

const last = spectrumStops.length - 1;
const percent = (index: number) => (index / last) * 100;

// Two handles on top of each other. Only the handles take the pointer, so the
// dots behind them can be clicked too.
const handleClass =
  "pointer-events-none absolute -inset-x-3 top-0 h-full w-[calc(100%+1.5rem)] appearance-none bg-transparent focus-visible:outline-hidden [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-6 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-zinc-700 [&::-moz-range-thumb]:bg-white dark:[&::-moz-range-thumb]:border-zinc-200 dark:[&::-moz-range-thumb]:bg-zinc-900 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-6 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-zinc-700 [&::-webkit-slider-thumb]:bg-white focus-visible:[&::-webkit-slider-thumb]:ring-4 focus-visible:[&::-webkit-slider-thumb]:ring-zinc-400 dark:[&::-webkit-slider-thumb]:border-zinc-200 dark:[&::-webkit-slider-thumb]:bg-zinc-900";

// Pick a part of the political spectrum, then select the parties in it
export default function SpectrumRange() {
  const { parties } = useParties();
  const { setSelectedParties } = useSelectedParties();
  const { i } = useI18n();
  // Indexes into `spectrumStops` of the two handles, the whole spectrum to
  // start with. Either handle can pass the other, so that two handles on the
  // same dot can still be dragged both ways.
  const [handles, setHandles] = useState<[number, number]>([0, last]);
  const [first, second] = handles;
  const from = Math.min(first, second);
  const to = Math.max(first, second);

  const label = (index: number) =>
    i(`spectrum.${getPosition(spectrumStops[index]).full}`);
  const inRange = parties.filter(
    (party) =>
      party.position >= spectrumStops[from] &&
      party.position <= spectrumStops[to],
  );
  const seats = inRange.reduce((acc, party) => acc + party.seats, 0);

  // A click on a dot moves the closest handle there
  function pick(index: number) {
    if (index <= from) setHandles([index, to]);
    else if (index >= to) setHandles([from, index]);
    else if (index - from < to - index) setHandles([index, to]);
    else setHandles([from, index]);
  }

  return (
    <div className="mt-1 rounded-2xl bg-zinc-200 p-4 dark:bg-zinc-700">
      <div className="relative mx-3 h-8">
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-white dark:bg-zinc-900"></div>
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-zinc-700 dark:bg-zinc-200"
          style={{
            left: `${percent(from)}%`,
            width: `${percent(to) - percent(from)}%`,
          }}
        ></div>
        {spectrumStops.map((stop, index) => {
          const isIncluded = index >= from && index <= to;
          return (
            <button
              key={stop}
              type="button"
              tabIndex={-1}
              onClick={() => pick(index)}
              className={`absolute top-1/2 size-4 -translate-1/2 rounded-full border-2 transition-colors ${
                isIncluded
                  ? "border-zinc-700 bg-zinc-700 dark:border-zinc-200 dark:bg-zinc-200"
                  : "border-zinc-400 bg-white dark:border-zinc-500 dark:bg-zinc-900"
              }`}
              style={{ left: `${percent(index)}%` }}
              title={label(index)}
              aria-label={label(index)}
            ></button>
          );
        })}
        <input
          type="range"
          min={0}
          max={last}
          step={1}
          value={first}
          onChange={(e) => setHandles([Number(e.target.value), second])}
          className={handleClass}
          aria-label={i("controls.spectrumHandle")}
          aria-valuetext={label(first)}
        />
        <input
          type="range"
          min={0}
          max={last}
          step={1}
          value={second}
          onChange={(e) => setHandles([first, Number(e.target.value)])}
          className={handleClass}
          aria-label={i("controls.spectrumHandle")}
          aria-valuetext={label(second)}
        />
      </div>

      {/* The labels under the dots, where there is room for them */}
      <div className="relative mx-3 mt-1 hidden h-8 sm:block">
        {spectrumStops.map((stop, index) => (
          <span
            key={stop}
            className={`absolute w-16 -translate-x-1/2 text-center text-[11px] leading-tight ${
              index >= from && index <= to ? "opacity-100" : "opacity-50"
            }`}
            style={{ left: `${percent(index)}%` }}
          >
            {label(index)}
          </span>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs opacity-75 sm:hidden">
        <span>{label(0)}</span>
        <span>{label(last)}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm">
          <span className="font-semibold">
            {from === to ? label(from) : `${label(from)} – ${label(to)}`}
          </span>
          <span className="opacity-75">
            {" · "}
            {pluralize(
              inRange.length,
              i("controls.party"),
              i("controls.parties"),
            )}
            {", "}
            {pluralize(
              seats,
              i("header.seat").toLowerCase(),
              i("header.seats").toLowerCase(),
            )}
          </span>
        </p>
        <button
          type="button"
          onClick={() => setSelectedParties(inRange)}
          className="rounded-full border-2 border-transparent bg-white px-3 py-1 text-nowrap transition-colors hover:bg-zinc-700 hover:text-white dark:bg-zinc-900 dark:hover:bg-zinc-200 dark:hover:text-zinc-950"
        >
          <span className="flex items-center justify-center gap-1">
            <CheckIcon className="size-5 shrink-0" />
            {i("controls.apply")}
          </span>
        </button>
      </div>
    </div>
  );
}
