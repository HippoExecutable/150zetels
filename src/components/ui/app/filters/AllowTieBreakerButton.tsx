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
  useI18n,
} from "@/lib/zustandStore";
import { isSameThreshold, simpleMajority } from "@/utils/getMajority";
import { CheckIcon } from "@heroicons/react/16/solid";

export default function AllowTieBreakerButton() {
  const { allowTieBreaker, setAllowTieBreaker } = useAllowTieBreaker();
  const { majorityThreshold } = useMajorityThreshold();
  const { i } = useI18n();
  // Ties can only happen when the threshold is exactly one half
  const isDisabled = !isSameThreshold(majorityThreshold, simpleMajority);

  return (
    <>
      <div className="justify-start text-nowrap sm:w-auto">
        <label
          className={`flex max-w-fit items-center gap-2 transition-opacity ${
            isDisabled ? "opacity-50" : ""
          }`}
          title={
            isDisabled ? i("body.tieBreakerSimpleMajorityOnly") : undefined
          }
        >
          <span className="relative">
            <input
              title="Allow Tie Breaker"
              type="checkbox"
              name="allowTieBreaker"
              id="allowTieBreaker"
              className="absolute h-full w-full opacity-0"
              checked={allowTieBreaker}
              disabled={isDisabled}
              onChange={() => {
                setAllowTieBreaker(!allowTieBreaker);
              }}
            />
            <div
              role="checkbox"
              aria-label={"Allow Tie Breaker"}
              aria-checked={allowTieBreaker}
              aria-disabled={isDisabled}
              className={`${
                allowTieBreaker
                  ? "bg-zinc-700 dark:bg-zinc-200"
                  : "bg-zinc-200 dark:bg-zinc-700"
              } flex aspect-square size-6 items-center justify-center overflow-hidden rounded-full transition-colors`}
            >
              {allowTieBreaker ? (
                <div className="flex h-full w-full items-center justify-center text-white dark:text-zinc-950">
                  <CheckIcon className="size-4.5" />
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-zinc-200 text-white dark:bg-zinc-700 dark:text-zinc-950"></div>
              )}
            </div>
          </span>
          <span className="text-wrap select-none">
            {i("body.allowTieBreaker")}
          </span>
        </label>
      </div>
    </>
  );
}
