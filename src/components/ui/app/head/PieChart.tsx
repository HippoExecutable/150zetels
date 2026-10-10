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
import {
  IsEditModeState,
  MajorityThresholdState,
  PartiesState,
  SelectedPartiesState,
  SortByState,
} from "@/types";
import { sort } from "@/utils/sort";
import { ResponsivePie } from "@nivo/pie";
import { useState, useEffect } from "react";

export default function PieChart({
  parties,
  selectedParties,
  isEditMode,
  sortBy,
  majorityThreshold,
}: {
  parties: PartiesState["parties"];
  selectedParties: SelectedPartiesState["selectedParties"];
  isEditMode: IsEditModeState["isEditMode"];
  sortBy: SortByState["sortBy"];
  majorityThreshold: MajorityThresholdState["majorityThreshold"];
}) {
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark"),
  );

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
      <ResponsivePie
        data={[
          ...selectedParties
            .sort((a, b) => sort(a, b, isEditMode, sortBy))
            .map((party) => ({
              id: party.name.length < 1 ? party.shortName : party.name,
              label: party.name.length < 1 ? party.shortName : party.name,
              value: party.seats,
              color: party.colour,
            })),
          {
            id: "empty",
            label: "empty",
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
        activeOuterRadiusOffset={8}
        enableArcLinkLabels={false}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor="#333333"
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: "color" }}
        enableArcLabels={false}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
        isInteractive={false}
        transitionMode="innerRadius"
        motionConfig="default"
      />
      {parties.length > 0 && (
        // Rotates around the centre of the half pie, from -90deg (0%) to 90deg (100%)
        <div
          className="absolute top-px left-[calc(50%-1px)] h-full w-0.5 origin-bottom transition-transform duration-300"
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
