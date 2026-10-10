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

import { useAllowTieBreaker, useI18n } from "@/lib/zustandStore";
import { CheckIcon } from "@heroicons/react/16/solid";

export default function AllowTieBreakerButton() {
  const { allowTieBreaker, setAllowTieBreaker } = useAllowTieBreaker();
  const { i } = useI18n();

  return (
    <>
      <label className="flex max-w-fit items-center gap-2 text-sm">
        <span className="relative">
          <input
            title="Allow Tie Breaker"
            type="checkbox"
            name="allowTieBreaker"
            id="allowTieBreaker"
            className="absolute h-full w-full opacity-0"
            checked={allowTieBreaker}
            onChange={() => {
              setAllowTieBreaker(!allowTieBreaker);
            }}
          />
          <div
            role="checkbox"
            aria-label={"Allow Tie Breaker"}
            aria-checked={allowTieBreaker}
            className={`${
              allowTieBreaker
                ? "bg-zinc-700 dark:bg-zinc-200"
                : "bg-white dark:bg-zinc-900"
            } flex aspect-square size-5 items-center justify-center overflow-hidden rounded-full transition-colors`}
          >
            {allowTieBreaker && (
              <div className="flex h-full w-full items-center justify-center text-white dark:text-zinc-950">
                <CheckIcon className="size-4" />
              </div>
            )}
          </div>
        </span>
        <span className="select-none">{i("body.allowTieBreaker")}</span>
      </label>
    </>
  );
}
