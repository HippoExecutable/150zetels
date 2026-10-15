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
  defaultPoll,
  getCabinetPeriods,
  getCurrentSeats,
  getPartyHistory,
  getParlementUrl,
  getPartyInfo,
  getSuccessor,
  getWikipediaUrl,
  isPoll,
  PartyInfo,
} from "@/data/partyInfo";
import { polls } from "@/data/polls";
import { useI18n, usePartyInfo, useSelectedPreset } from "@/lib/zustandStore";
import {
  ArrowTopRightOnSquareIcon,
  ChevronUpDownIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { useEffect, useRef, useState } from "react";
import PartyHistoryChart, { HistorySeries } from "./PartyHistoryChart";

function PartyLink({ party }: { party: PartyInfo }) {
  const { setPartyKey } = usePartyInfo();
  return (
    <button
      type="button"
      onClick={() => setPartyKey(party.key)}
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-sm transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700"
    >
      <span
        className="size-3 shrink-0 rounded-full"
        style={{ backgroundColor: party.colours[0] }}
      ></span>
      <span className="underline">{party.shortName}</span>
    </button>
  );
}

// A link to read more elsewhere, with a monogram for the site
function SourceLink({
  href,
  monogram,
  site,
  description,
  colour,
}: {
  href: string;
  monogram: React.ReactNode;
  site: string;
  description: string;
  colour: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="group flex items-center gap-3 rounded-xl border-2 border-zinc-200 p-2 transition-colors hover:border-(--party-colour) dark:border-zinc-700 dark:hover:border-(--party-colour)"
      style={{ "--party-colour": colour } as React.CSSProperties}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xl dark:bg-zinc-800">
        {monogram}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{site}</span>
        <span className="block truncate text-xs opacity-75">{description}</span>
      </span>
      <ArrowTopRightOnSquareIcon className="size-4 shrink-0 opacity-50 transition-opacity group-hover:opacity-100" />
    </a>
  );
}

function toSeries(
  party: PartyInfo,
  isMain: boolean,
  pollName: string,
): HistorySeries {
  const seats = isMain ? getCurrentSeats(party.key, pollName) : null;
  return {
    key: party.key,
    shortName: party.shortName,
    colour: party.colours[0],
    history: getPartyHistory(party.key),
    currentSeats: seats?.tweedeKamer,
    pollSeats: seats?.poll,
    cabinets: isMain ? getCabinetPeriods(party.key) : undefined,
  };
}

// A quiet dropdown in place of the label of the poll's seats
function PollSelect({
  pollName,
  setPollName,
}: {
  pollName: string;
  setPollName: (by: string) => void;
}) {
  const { i } = useI18n();
  return (
    <label className="relative -ms-0.5 flex max-w-full cursor-pointer items-center text-xs opacity-75 transition-opacity hover:opacity-100">
      <select
        value={pollName}
        onChange={(e) => setPollName(e.target.value)}
        className="w-full min-w-0 cursor-pointer appearance-none truncate bg-transparent ps-0.5 pe-4 outline-hidden dark:scheme-dark"
        title={i("partyInfo.choosePoll")}
        aria-label={i("partyInfo.choosePoll")}
      >
        {polls.map((poll) => (
          <option key={poll.name} value={poll.name}>
            {poll.name}
          </option>
        ))}
      </select>
      <ChevronUpDownIcon className="pointer-events-none absolute end-0 size-3.5" />
    </label>
  );
}

function PartyInfoContent({
  party,
  pollName,
  setPollName,
}: {
  party: PartyInfo;
  pollName: string;
  setPollName: (by: string) => void;
}) {
  const { i } = useI18n();
  const seats = getCurrentSeats(party.key, pollName);
  const predecessors = (party.fusion?.parties ?? [])
    .map((key) => getPartyInfo(key))
    .filter((p): p is PartyInfo => p !== null);
  const successor = getSuccessor(party.key);
  const splitFrom = getPartyInfo(party.split?.from);
  const series = [
    toSeries(party, true, pollName),
    ...predecessors.map((p) => toSeries(p, false, pollName)),
  ];

  const seatRows: {
    label: React.ReactNode;
    seats: number | null;
    total: number;
  }[] = [
    { label: i("partyInfo.tweedeKamer"), seats: seats.tweedeKamer, total: 150 },
    { label: i("partyInfo.eersteKamer"), seats: seats.eersteKamer, total: 75 },
    {
      label: i("partyInfo.europeesParlement"),
      seats: seats.europeesParlement,
      total: 31,
    },
    {
      label: <PollSelect pollName={pollName} setPollName={setPollName} />,
      seats: seats.poll,
      total: 150,
    },
  ];

  return (
    <>
      <div className="flex items-start gap-3 pe-10">
        <div className="mt-1.5 flex shrink-0 -space-x-1.5">
          {party.colours.map((colour) => (
            <span
              key={colour}
              className="size-5 rounded-full border-2 border-white dark:border-zinc-900"
              style={{ backgroundColor: colour }}
            ></span>
          ))}
        </div>
        <div>
          <h2 className="text-xl leading-tight font-bold">{party.name}</h2>
          <p className="opacity-75">{party.shortName}</p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt className="opacity-75">
          {party.colours.length > 1
            ? i("partyInfo.colours")
            : i("partyInfo.colour")}
        </dt>
        <dd className="flex flex-wrap gap-x-3 gap-y-1">
          {party.colours.map((colour) => (
            <span key={colour} className="flex items-center gap-1.5">
              <span
                className="size-3 rounded-sm"
                style={{ backgroundColor: colour }}
              ></span>
              <code className="uppercase">{colour}</code>
            </span>
          ))}
        </dd>
        {party.fusion && (
          <>
            <dt className="opacity-75">{i("partyInfo.fusion")}</dt>
            <dd>
              {party.fusion.year} (
              {predecessors.map((p) => p.shortName).join(", ")})
            </dd>
          </>
        )}
        {splitFrom && (
          <>
            <dt className="opacity-75">{i("partyInfo.splitFrom")}</dt>
            <dd className="-ms-2">
              <PartyLink party={splitFrom} /> ({party.split?.year})
            </dd>
          </>
        )}
        {successor && (
          <>
            <dt className="opacity-75">{i("partyInfo.mergedInto")}</dt>
            <dd className="-ms-2">
              <PartyLink party={successor} /> ({successor.fusion?.year})
            </dd>
          </>
        )}
      </dl>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <SourceLink
          href={getWikipediaUrl(party)}
          monogram={<span className="font-serif">W</span>}
          site="Wikipedia"
          description={
            party.wikipedia
              ? i("partyInfo.wikipediaDescription")
              : i("partyInfo.searchWikipedia")
          }
          colour={party.colours[0]}
        />
        <SourceLink
          href={getParlementUrl(party)}
          monogram={<span className="font-bold text-[#E1001A]">P</span>}
          site="Parlement.com"
          description={
            party.parlement
              ? i("partyInfo.parlementDescription")
              : i("partyInfo.searchParlement")
          }
          colour={party.colours[0]}
        />
      </div>

      <h3 className="mt-5 mb-2 text-sm font-semibold opacity-75">
        {i("partyInfo.currentSeats")}
      </h3>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {seatRows.map((row, index) => (
          <li
            key={index}
            className="rounded-xl border-2 border-zinc-200 p-2 dark:border-zinc-700"
          >
            {typeof row.label === "string" ? (
              <p className="text-xs opacity-75">{row.label}</p>
            ) : (
              row.label
            )}
            <p className="text-lg font-semibold tabular-nums">
              {row.seats ? (
                <>
                  {row.seats}
                  <span className="text-sm font-normal opacity-60">
                    {" "}
                    / {row.total}
                  </span>
                </>
              ) : (
                <span className="opacity-40">–</span>
              )}
            </p>
          </li>
        ))}
      </ul>

      <h3 className="mt-5 mb-2 text-sm font-semibold opacity-75">
        {i("partyInfo.history")}
      </h3>
      <PartyHistoryChart series={series} pollName={pollName} />
      {predecessors.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1 text-sm">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 font-semibold">
            <span
              className="size-3 shrink-0 rounded-full"
              style={{ backgroundColor: party.colours[0] }}
            ></span>
            {party.shortName}
          </span>
          {predecessors.map((p) => (
            <PartyLink key={p.key} party={p} />
          ))}
        </div>
      )}
      <p className="mt-2 text-xs opacity-60">{i("partyInfo.historyNote")}</p>
    </>
  );
}

// Opened from the "?" on a party card, or by clicking a party in the pie chart
export default function PartyInfoDialog() {
  const { i } = useI18n();
  const { partyKey, setPartyKey } = usePartyInfo();
  const { selectedPreset } = useSelectedPreset();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const party = getPartyInfo(partyKey);
  // Until one is chosen, the poll being viewed, or otherwise the default one.
  // Kept while clicking through to other parties.
  const [chosenPoll, setChosenPoll] = useState<string | null>(null);
  const pollName =
    chosenPoll ??
    (selectedPreset && isPoll(selectedPreset.name)
      ? selectedPreset.name
      : defaultPoll);

  // Closing clears the party, and the effect below then closes the dialog.
  // This does not wait for the dialog's close event, which some browsers
  // leave out.
  function close() {
    setPartyKey(null);
    setChosenPoll(null);
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (party && !dialog.open) dialog.showModal();
    if (!party && dialog.open) dialog.close();
    // Back to the top when a legend link opens another party
    dialog.scrollTop = 0;
  }, [party]);

  return (
    <dialog
      ref={dialogRef}
      // Escape
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      // In case the dialog is closed some other way
      onClose={close}
      // Closes when clicking the backdrop, which counts as the dialog itself
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      className="m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl overflow-auto rounded-2xl border-2 border-zinc-200 bg-white p-0 text-zinc-950 shadow-xl backdrop:bg-black/50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
      aria-label={party?.name}
    >
      {party && (
        <div className="relative p-4">
          <button
            type="button"
            onClick={close}
            className="absolute top-3 right-3 rounded-full p-1 transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700"
            title={i("partyInfo.close")}
            aria-label={i("partyInfo.close")}
          >
            <XMarkIcon className="size-6" />
          </button>
          <PartyInfoContent
            party={party}
            pollName={pollName}
            setPollName={setChosenPoll}
          />
        </div>
      )}
    </dialog>
  );
}
