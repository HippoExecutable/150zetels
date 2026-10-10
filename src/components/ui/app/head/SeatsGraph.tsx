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
  useSelectedParties,
  useI18n,
  useSortBy,
  useIsEditMode,
} from "@/lib/zustandStore";
import { sort } from "@/utils/sort";
import { getMajority } from "@/utils/getMajority";
import { pluralize } from "@/utils/pluralize";
import { ChevronDownIcon } from "@heroicons/react/16/solid";

export default function SeatsGraph() {
  const { parties } = useParties();
  const { selectedParties } = useSelectedParties();
  const { allowTieBreaker } = useAllowTieBreaker();
  const { majorityThreshold } = useMajorityThreshold();
  const { isEditMode } = useIsEditMode();
  const { sortBy } = useSortBy();
  const { i } = useI18n();

  const total = parties.reduce((acc, party) => acc + party.seats, 0);
  const selectedTotal = selectedParties.reduce(
    (acc, party) => acc + party.seats,
    0,
  );

  const majority = getMajority(
    total,
    selectedTotal,
    allowTieBreaker,
    majorityThreshold,
  );
  const thresholdPercent =
    (majorityThreshold.numerator / majorityThreshold.denominator) * 100;

  return (
    <>
      <div className="sticky top-0 z-50 -mx-4 bg-white px-4 pt-[calc(env(safe-area-inset-top)+12px)] pb-4 transition-colors duration-300 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <p
            className={`shrink-0 transition-[width] duration-300 ${thresholdPercent > 50 ? "pe-12" : ""}`}
            // Ends half a chevron before the threshold line, so the chevron sits on it
            style={{ width: `calc(${thresholdPercent}% - 0.625rem)` }}
          >
            {
              // All parties selected or no parties selected
              majority.status === "all" || majority.status === "none" ? (
                ""
              ) : // Tie-breaking majority
              majority.status === "tie-breaking majority" ? (
                <span className="line-clamp-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  {i("header.tieBreakingMajority")}
                </span>
              ) : // Majority achieved
              majority.status === "majority" ? (
                <span className="line-clamp-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  {pluralize(
                    majority.margin,
                    i("header.seat"),
                    i("header.seats"),
                  )}{" "}
                  {i("header.majority")}
                </span>
              ) : (
                // Not yet a majority
                <span className="line-clamp-1 text-rose-600 dark:text-rose-400">{`${pluralize(
                  majority.margin,
                  i("header.seat"),
                  i("header.seats"),
                )} ${i("header.left")}`}</span>
              )
            }
          </p>
          <div
            className="relative flex items-center justify-center"
            title={i("header.seatsForMajority").replace(
              "{count}",
              majority.seatsForMajority.toString(),
            )}
          >
            <ChevronDownIcon className="size-5" />
            <p
              className={`absolute ${thresholdPercent > 50 ? "inset-e-5" : "inset-s-5"}`}
            >
              {majority.seatsForMajority}{" "}
            </p>
          </div>
          <div className="flex min-w-0 flex-1 justify-end text-end">
            <p
              className="truncate tabular-nums"
              title={`${selectedTotal} / ${total}`}
            >
              <span className="font-semibold">{selectedTotal}</span> / {total}
            </p>
          </div>
        </div>
        <div
          className="relative flex h-4 overflow-hidden rounded-2xl bg-zinc-200 transition-all dark:bg-zinc-700"
          dir={sortBy === "position" ? "ltr" : ""}
        >
          {[...parties]
            .sort((a, b) => sort(a, b, isEditMode, sortBy))
            .map((party) => (
              <div
                key={party.id}
                title={`${
                  party.isIndependent
                    ? party.shortName.length > 0
                      ? party.shortName + " (I)"
                      : "Independent"
                    : party.shortName
                } (${party.seats})`}
                style={{
                  backgroundColor: party.colour,
                  minWidth: "0%",
                  width: selectedParties.some((p) => p.id === party.id)
                    ? `${(party.seats / total) * 100}%`
                    : "0%",
                }}
                className={`r-0 h-full overflow-hidden text-nowrap text-ellipsis transition-[width] duration-300`}
              ></div>
            ))}
          <div
            className="bg-background-elevated absolute h-full border-l-2 border-dashed border-white transition-[inset-inline-start] duration-300"
            style={{ insetInlineStart: `calc(${thresholdPercent}% - 1px)` }}
          ></div>
        </div>
      </div>
    </>
  );
}
