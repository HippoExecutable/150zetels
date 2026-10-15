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
import {
  AllocationMethod,
  allocateSeats,
  allocationMethods,
  sumVotes,
} from "@/utils/allocateSeats";
import { CalculatorIcon } from "@heroicons/react/20/solid";
import { useState } from "react";

export default function SeatAllocationEditor() {
  const { parties, setParties } = useParties();
  const { selectedParties, setSelectedParties } = useSelectedParties();
  const { i } = useI18n();
  const [totalSeats, setTotalSeats] = useState("");
  const [method, setMethod] = useState<AllocationMethod>("dHondt");

  const currentTotal = parties.reduce((acc, party) => acc + party.seats, 0);
  const votes = parties.map((party) => party.votes ?? 0);

  // An empty field keeps the current number of seats
  const seatCount = totalSeats ? Number(totalSeats) : currentTotal;
  const canAllocate =
    Number.isInteger(seatCount) &&
    seatCount > 0 &&
    seatCount <= 99999 &&
    sumVotes(votes) > 0;

  const allocate = () => {
    const seats = allocateSeats(votes, seatCount, method);
    const newParties = parties.map((party, index) => ({
      ...party,
      seats: seats[index],
    }));

    setParties(newParties);
    setSelectedParties(
      selectedParties.map(
        (selected) => newParties.find((p) => p.id === selected.id) ?? selected,
      ),
    );
  };

  return (
    <div className="mb-4 flex flex-col gap-2 rounded-2xl border-2 border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
      <span className="text-sm font-semibold opacity-75">
        {i("allocation.title")}
      </span>
      <div className="flex flex-wrap gap-4">
        <label className="flex min-w-36 flex-1 flex-col gap-1">
          <span className="text-xs opacity-75">
            {i("allocation.totalSeats")}
          </span>
          <input
            name="totalSeats"
            type="number"
            inputMode="numeric"
            placeholder={currentTotal.toString()}
            className="w-full border-b border-zinc-200 bg-transparent outline-hidden dark:border-zinc-700"
            min={1}
            max={99999}
            value={totalSeats}
            onChange={(e) => setTotalSeats(e.target.value)}
          />
        </label>
        <label className="flex min-w-36 flex-1 flex-col gap-1">
          <span className="text-xs opacity-75">{i("allocation.method")}</span>
          <select
            name="allocationMethod"
            className="w-full border-b border-zinc-200 bg-transparent outline-hidden dark:border-zinc-700 dark:scheme-dark"
            value={method}
            onChange={(e) => setMethod(e.target.value as AllocationMethod)}
          >
            {allocationMethods.map((id) => (
              <option key={id} value={id}>
                {i(`allocation.${id}`)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs opacity-75">{i("allocation.hint")}</p>
        <button
          onClick={allocate}
          disabled={!canAllocate}
          className="rounded-full border-2 border-transparent bg-zinc-200 px-3 py-1 text-nowrap transition-colors hover:bg-zinc-700 hover:text-white disabled:pointer-events-none disabled:opacity-50 dark:bg-zinc-700 dark:hover:bg-zinc-200 dark:hover:text-zinc-950"
          type="button"
        >
          <span className="flex items-center justify-center gap-1">
            <CalculatorIcon className="size-5 shrink-0" />
            {i("allocation.calculate")}
          </span>
        </button>
      </div>
    </div>
  );
}
