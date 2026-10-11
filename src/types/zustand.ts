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

import { Preset, PresetInfo, MajorityThreshold, Party } from "@/types";

interface DefaultPresetValueState {
  defaultPresetValue: string | null;
  setDefaultPresetValue: (by: string) => void;
}

interface PartiesState {
  parties: Party[];
  setParties: (by: Party[]) => void;
}

interface SelectedPartiesState {
  selectedParties: Party[];
  setSelectedParties: (by: Party[]) => void;
}

interface IsEditModeState {
  isEditMode: boolean;
  setIsEditMode: (by: boolean) => void;
}

interface SortByState {
  sortBy: "name" | "seats" | "position";
  setSortBy: (by: "name" | "seats" | "position") => void;
}

interface AllowTieBreakerState {
  allowTieBreaker: boolean;
  setAllowTieBreaker: (by: boolean) => void;
}

interface MajorityThresholdState {
  majorityThreshold: MajorityThreshold;
  setMajorityThreshold: (by: MajorityThreshold) => void;
}

interface I18nState {
  locale: string;
  i: (key: string) => string;
  setLocale: (by: string) => void;
}

interface SelectedPresetState {
  selectedPreset: Preset | null;
  setSelectedPreset: (by: Preset | null) => void;
}

interface CustomInfoState {
  customInfo: PresetInfo;
  setCustomInfo: (by: PresetInfo) => void;
}

export type {
  DefaultPresetValueState,
  PartiesState,
  SelectedPartiesState,
  IsEditModeState,
  SortByState,
  AllowTieBreakerState,
  MajorityThresholdState,
  I18nState,
  SelectedPresetState,
  CustomInfoState,
};
