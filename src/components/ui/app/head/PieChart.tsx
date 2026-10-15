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

import { pieChartDarkColor, pieChartLightColor } from "@/components/colors";
import { useI18n, useSelectedPreset } from "@/lib/zustandStore";
import { getLatestElectionSeats, getPartyKey, isPoll } from "@/data/partyInfo";
import SeatChange from "../parties/SeatChange";
import {
  IsEditModeState,
  MajorityThresholdState,
  Party,
  PartiesState,
  SelectedPartiesState,
  SortByState,
} from "@/types";
import { getPartyLabel } from "@/utils/partyLabel";
import { pluralize } from "@/utils/pluralize";
import { sort } from "@/utils/sort";
import { PieTooltipProps, ResponsivePie } from "@nivo/pie";
import { patternLinesDef } from "@nivo/core";
import { useState, useEffect } from "react";

interface PieDatum {
  id: string;
  label: string;
  value: number;
  color: string;
  // Left out for the empty slice of unselected seats
  party?: Party;
}

const emptyId = "empty";

function PartyTooltip({ datum }: PieTooltipProps<PieDatum>) {
  const { i } = useI18n();
  const { selectedPreset } = useSelectedPreset();
  const { party } = datum.data;
  if (!party) return null;
  // Polls are compared with the latest election
  const election = isPoll(selectedPreset?.name)
    ? getLatestElectionSeats(getPartyKey(party.id))
    : null;

  return (
    <div className="rounded-2xl border-2 border-zinc-200 bg-white px-2.5 py-1 text-sm text-nowrap text-zinc-950 shadow-lg dark:border-zinc-700 dark:bg-zinc-900 dark:text-white">
      <div className="flex items-center gap-2">
        <span
          className="size-3 shrink-0 rounded-full"
          style={{ backgroundColor: party.colour }}
        ></span>
        <span>{getPartyLabel(party)}</span>
        {party.isSupport && (
          <span className="text-xs opacity-75">({i("support.label")})</span>
        )}
        <span className="font-semibold tabular-nums">
          {pluralize(party.seats, i("header.seat"), i("header.seats"))}
        </span>
      </div>
      {election && (
        <div className="flex items-center gap-2 text-xs">
          <span className="opacity-75">
            {i("body.electionSeats").replace("{year}", String(election.year))}:{" "}
            {election.seats}
          </span>
          <SeatChange change={party.seats - election.seats} />
        </div>
      )}
    </div>
  );
}

export default function PieChart({
  parties,
  selectedParties,
  isEditMode,
  sortBy,
  majorityThreshold,
  onPartyClick,
}: {
  parties: PartiesState["parties"];
  selectedParties: SelectedPartiesState["selectedParties"];
  isEditMode: IsEditModeState["isEditMode"];
  sortBy: SortByState["sortBy"];
  majorityThreshold: MajorityThresholdState["majorityThreshold"];
  // Left out where clicking a party does nothing, like in embeds
  onPartyClick?: (party: Party) => void;
}) {
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark"),
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);
  return (
    <>
      <div
        className="size-full"
        style={{ cursor: activeId && onPartyClick ? "pointer" : undefined }}
      >
        <ResponsivePie<PieDatum>
          data={[
            ...selectedParties
              .sort((a, b) => sort(a, b, isEditMode, sortBy))
              .map((party) => ({
                id: party.id,
                label: party.name.length < 1 ? party.shortName : party.name,
                value: party.seats,
                color: party.colour,
                party,
              })),
            {
              id: emptyId,
              label: emptyId,
              value:
                parties.reduce((acc, party) => acc + party.seats, 0) -
                selectedParties.reduce((acc, party) => acc + party.seats, 0),
              color: isDarkMode ? pieChartDarkColor : pieChartLightColor,
            },
          ]}
          padAngle={0}
          startAngle={-90}
          endAngle={90}
          margin={{ top: 2, right: 2, bottom: 0, left: 2 }}
          sortByValue={false}
          innerRadius={0.35}
          colors={{ datum: "data.color" }}
          // Grows inwards, since the margin leaves no room to grow outwards
          activeInnerRadiusOffset={8}
          activeId={activeId}
          onActiveIdChange={(id) =>
            setActiveId(id === null || id === emptyId ? null : String(id))
          }
          tooltip={PartyTooltip}
          // Stripes for parties with gedoogsteun, like in the seats bar
          defs={selectedParties
            .filter((party) => party.isSupport)
            .map((party) =>
              patternLinesDef(`support-${party.id}`, {
                background: party.colour,
                color: "rgba(255, 255, 255, 0.35)",
                rotation: -45,
                lineWidth: 5,
                spacing: 10,
              }),
            )}
          fill={selectedParties
            .filter((party) => party.isSupport)
            .map((party) => ({
              match: { id: party.id },
              id: `support-${party.id}`,
            }))}
          onClick={(datum) => {
            if (datum.data.party) onPartyClick?.(datum.data.party);
          }}
          enableArcLinkLabels={false}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor="#333333"
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: "color" }}
          enableArcLabels={false}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
          isInteractive={true}
          transitionMode="innerRadius"
          motionConfig="default"
        />
      </div>
      {parties.length > 0 && (
        // Rotates around the centre of the half pie, from -90deg (0%) to 90deg (100%)
        <div
          className="pointer-events-none absolute top-px left-[calc(50%-1px)] h-full w-0.5 origin-bottom transition-transform duration-300"
          style={{
            transform: `rotate(${
              (majorityThreshold.numerator / majorityThreshold.denominator) *
                180 -
              90
            }deg)`,
          }}
        >
          <div className="bg-background-elevated h-[64.5%] border-l-2 border-dashed border-white"></div>
        </div>
      )}
    </>
  );
}
