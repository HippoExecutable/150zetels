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

import { MajorityThreshold } from "./majority";
import { Party } from "./party";
import { SortByState } from "./zustand";

export interface Country {
  name: string;
  emoji?: string;
  parties: Party[];
  updateDate: string;
}

export type CountryInfo = Pick<Country, "name" | "updateDate">;

export interface CountryData extends CountryInfo {
  parties: Party[];
  selectedParties: Party[];
  // Left out when the importer should keep their own settings
  majorityThreshold?: MajorityThreshold;
  allowTieBreaker?: boolean;
  sortBy?: SortByState["sortBy"];
  locale?: string;
}
