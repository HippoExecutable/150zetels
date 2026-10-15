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
  useIsEditMode,
  useParties,
  useI18n,
  usePartyInfo,
  useSelectedPreset,
} from "@/lib/zustandStore";
import {
  getCurrentSeats,
  getPartyInfo,
  getPartyKey,
  isPoll,
} from "@/data/partyInfo";
import SeatChange from "./SeatChange";
import { supportStripes } from "@/components/colors";

import { Party } from "@/types";
import { getPosition } from "@/utils/getPosition";
import {
  PlusCircleIcon,
  MinusCircleIcon,
  TrashIcon,
  QuestionMarkCircleIcon,
  HandRaisedIcon,
} from "@heroicons/react/24/outline";
import { HandRaisedIcon as HandRaisedSolidIcon } from "@heroicons/react/24/solid";

export default function PartyButton({ party }: { party: Party }) {
  const { isEditMode } = useIsEditMode();
  const { parties, setParties } = useParties();
  const { selectedParties, setSelectedParties } = useSelectedParties();

  const selected = selectedParties.some((p) => p.id === party.id);
  //   const colour = party.isIndependent ? "#62748e" : party.colour;
  const colour = party.colour;
  const partyName = party.isIndependent
    ? party.shortName.length > 0
      ? party.shortName + " (I)"
      : "Independent"
    : party.shortName;

  const shortDesc = `${partyName} (${party.seats})`;
  const { i } = useI18n();
  const { setPartyKey } = usePartyInfo();
  // Parties added by hand have no info
  const info = isEditMode ? null : getPartyInfo(getPartyKey(party.id));
  // In polls, the change compared with the seats in the Tweede Kamer now
  const { selectedPreset } = useSelectedPreset();
  const change =
    !isEditMode && isPoll(selectedPreset?.name)
      ? party.seats - (getCurrentSeats(getPartyKey(party.id)).tweedeKamer ?? 0)
      : 0;
  const PartyCard = isEditMode ? "div" : "button";
  return (
    <div className="relative">
      <PartyCard
        onClick={() => {
          if (isEditMode) return;
          if (selected) {
            setSelectedParties(
              selectedParties.filter((p) => p.id !== party.id),
            );
          } else {
            setSelectedParties([...selectedParties, party]);
          }
        }}
        className={`${
          isEditMode ? "items-start" : "cursor-pointer items-center"
        } ${isEditMode ? "" : info ? "pe-13" : "pe-8"} party-button flex w-full gap-2 overflow-hidden rounded-2xl border-2 bg-white p-2 shadow-lg transition-all duration-300 dark:bg-zinc-900`}
        style={{
          borderColor: selected ? colour : "var(--border-colour)", // dark mode #374151
          flexDirection: isEditMode ? "column" : "row",
        }}
        title={
          isEditMode
            ? ""
            : selected
              ? `Deselect ${shortDesc}`
              : `Select ${shortDesc}`
        }
        // disabled={isEditMode}
      >
        <div
          className={`relative ${
            isEditMode ? "flex w-full items-center justify-center" : ""
          }`}
        >
          {isEditMode && (
            <input
              name="partyColour"
              type="color"
              title="Party Colour"
              aria-label="Party Colour"
              className="absolute w-full cursor-pointer opacity-0"
              value={colour}
              onChange={(e) => {
                const newParty = { ...party, colour: e.target.value };
                setParties(
                  parties.map((p) => (p.id === party.id ? newParty : p)),
                );
                if (selected) {
                  setSelectedParties(
                    selectedParties.map((p) =>
                      p.id === party.id ? newParty : p,
                    ),
                  );
                }
              }}
            />
          )}
          <div
            className={`transition-all ${
              isEditMode
                ? "h-6 w-full rounded-full border-zinc-200 dark:border-zinc-700"
                : "aspect-square size-4 rounded-full"
            }`}
            style={{
              background:
                party.isSupport && !isEditMode
                  ? supportStripes(colour)
                  : colour,
            }}
            title={party.isSupport ? i("support.label") : undefined}
          ></div>
        </div>
        <span className={isEditMode ? "w-full" : "truncate"}>
          {isEditMode ? (
            <input
              name="partyName"
              type="text"
              placeholder="Party Name"
              className="w-full border-b border-zinc-200 bg-transparent outline-hidden dark:border-zinc-700"
              value={party.name}
              onChange={(e) => {
                const newParty = { ...party, name: e.target.value };
                setParties(
                  parties.map((p) => (p.id === party.id ? newParty : p)),
                );
                if (selected) {
                  setSelectedParties(
                    selectedParties.map((p) =>
                      p.id === party.id ? newParty : p,
                    ),
                  );
                }
              }}
            />
          ) : (
            partyName
          )}
        </span>

        {isEditMode && (
          <span className={isEditMode ? "w-full" : "truncate"}>
            <input
              name="partyShortName"
              type="text"
              placeholder="Party Short Name"
              className="w-full border-b border-zinc-200 bg-transparent outline-hidden dark:border-zinc-700"
              value={party.shortName}
              onChange={(e) => {
                const newParty = { ...party, shortName: e.target.value };
                setParties(
                  parties.map((p) => (p.id === party.id ? newParty : p)),
                );
                if (selected) {
                  setSelectedParties(
                    selectedParties.map((p) =>
                      p.id === party.id ? newParty : p,
                    ),
                  );
                }
              }}
            />
          </span>
        )}

        <span
          className={`font-semibold ${isEditMode ? "w-full" : "text-nowrap"}`}
        >
          {isEditMode ? (
            <input
              name="seats"
              type="number"
              placeholder="Seats"
              className="w-full border-b border-zinc-200 bg-transparent outline-hidden dark:border-zinc-700"
              min={0}
              max={99999}
              value={party.seats.toFixed(0)}
              onChange={(e) => {
                const newParty = { ...party, seats: parseInt(e.target.value) };
                setParties(
                  parties.map((p) => (p.id === party.id ? newParty : p)),
                );
                if (selected) {
                  setSelectedParties(
                    selectedParties.map((p) =>
                      p.id === party.id ? newParty : p,
                    ),
                  );
                }

                if (e.target.value.length <= 0) {
                  const newParty = { ...party, seats: 0 };
                  setParties(
                    parties.map((p) => (p.id === party.id ? newParty : p)),
                  );
                  if (selected) {
                    setSelectedParties(
                      selectedParties.map((p) =>
                        p.id === party.id ? newParty : p,
                      ),
                    );
                  }
                }
              }}
            />
          ) : (
            party.seats
          )}
        </span>
        <SeatChange
          change={change}
          title={i("body.changeFromNow")}
          className="-ms-1"
        />
        {isEditMode && (
          <label className="flex w-full items-center gap-2">
            <input
              name="votes"
              type="number"
              inputMode="decimal"
              className="w-full min-w-0 border-b border-zinc-200 bg-transparent outline-hidden dark:border-zinc-700"
              min={0}
              step="any"
              value={party.votes ?? ""}
              onChange={(e) => {
                const votes = parseFloat(e.target.value);
                const newParty = {
                  ...party,
                  votes: votes >= 0 ? votes : undefined,
                };
                setParties(
                  parties.map((p) => (p.id === party.id ? newParty : p)),
                );
                if (selected) {
                  setSelectedParties(
                    selectedParties.map((p) =>
                      p.id === party.id ? newParty : p,
                    ),
                  );
                }
              }}
            />
            <span className="shrink-0 text-sm opacity-75">
              {i("allocation.votes")}
            </span>
          </label>
        )}
        {isEditMode ? (
          <>
            <div className="flex w-full">
              <label className="flex w-full flex-col items-center gap-1">
                <input
                  name="position"
                  dir="ltr"
                  id="position-range"
                  step={25}
                  className="w-full appearance-none rounded-full bg-zinc-200 accent-zinc-500 dark:bg-zinc-700 dark:accent-zinc-300"
                  type="range"
                  min="-100"
                  max="100"
                  value={party.position}
                  onChange={(e) => {
                    const newParty = {
                      ...party,
                      position: parseInt(e.target.value),
                    };
                    setParties(
                      parties.map((p) => (p.id === party.id ? newParty : p)),
                    );
                    if (selected) {
                      setSelectedParties(
                        selectedParties.map((p) =>
                          p.id === party.id ? newParty : p,
                        ),
                      );
                    }
                  }}
                />
                <span className="text-center">
                  {i(`spectrum.${getPosition(party.position).full}`)}
                </span>
              </label>
            </div>
            <div className="flex w-full flex-col items-start gap-1 rounded-xl border border-zinc-200 px-2 py-1 dark:border-zinc-700">
              <div>
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    name="isIndependent"
                    value={party.isIndependent ? "1" : "0"}
                    checked={party.isIndependent}
                    className="accent-zinc-700 dark:accent-zinc-200"
                    onChange={(e) => {
                      const newParty = {
                        ...party,
                        isIndependent: e.target.checked,
                      };
                      setParties(
                        parties.map((p) => (p.id === party.id ? newParty : p)),
                      );
                      if (selected) {
                        setSelectedParties(
                          selectedParties.map((p) =>
                            p.id === party.id ? newParty : p,
                          ),
                        );
                      }
                    }}
                  />
                  <span className="select-none">
                    {i("spectrum.independent")}
                  </span>
                </label>
              </div>
            </div>
            <div className="flex w-full items-center justify-evenly gap-2">
              <button
                onClick={() => {
                  if (selected) {
                    setSelectedParties(
                      selectedParties.filter((p) => p.id !== party.id),
                    );
                  } else {
                    setSelectedParties([...selectedParties, party]);
                  }
                }}
                className={`transition-opacity hover:opacity-75`}
                type="button"
                title={selected ? "Deselect party" : "Select party"}
                aria-label={selected ? "Deselect party" : "Select party"}
              >
                {selected ? (
                  <MinusCircleIcon className="size-6 shrink-0" />
                ) : (
                  <PlusCircleIcon className="size-6 shrink-0" />
                )}
              </button>
              <button
                onClick={() => {
                  setParties(parties.filter((p) => p.id !== party.id));
                  if (selected) {
                    setSelectedParties(
                      selectedParties.filter((p) => p.id !== party.id),
                    );
                  }
                }}
                type="button"
                className={`transition-opacity hover:opacity-75`}
                title="Remove party"
                aria-label="Remove party"
              >
                <TrashIcon className="size-6 shrink-0" />
              </button>
            </div>
          </>
        ) : (
          // <span className="text-nowrap font-mono">
          //   {`[${getPosition(party.position).short}]`}
          // </span>
          <></>
        )}
      </PartyCard>
      {!isEditMode && (
        // Next to the card rather than in it, since the card is a button too
        <div className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center gap-0.5">
          <button
            type="button"
            onClick={() => {
              const newParty = { ...party, isSupport: !party.isSupport };
              setParties(
                parties.map((p) => (p.id === party.id ? newParty : p)),
              );
              if (selected) {
                setSelectedParties(
                  selectedParties.map((p) =>
                    p.id === party.id ? newParty : p,
                  ),
                );
              }
            }}
            className={`rounded-full transition-opacity hover:opacity-100 ${
              party.isSupport ? "opacity-100" : "opacity-60"
            }`}
            title={i("support.toggle").replace("{party}", partyName)}
            aria-label={i("support.toggle").replace("{party}", partyName)}
            aria-pressed={party.isSupport === true}
          >
            {party.isSupport ? (
              <HandRaisedSolidIcon className="size-4.5 shrink-0" />
            ) : (
              <HandRaisedIcon className="size-4.5 shrink-0" />
            )}
          </button>
          {info && (
            <button
              type="button"
              onClick={() => setPartyKey(info.key)}
              className="rounded-full opacity-60 transition-opacity hover:opacity-100"
              title={i("partyInfo.moreInfo").replace("{party}", info.shortName)}
              aria-label={i("partyInfo.moreInfo").replace(
                "{party}",
                info.shortName,
              )}
            >
              <QuestionMarkCircleIcon className="size-4.5 shrink-0" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
