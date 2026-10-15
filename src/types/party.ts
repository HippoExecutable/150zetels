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

export interface Party {
  id: string;
  name: string;
  shortName: string;
  seats: number;
  colour: string;
  position: number;
  isIndependent?: boolean;
  // Vote count or vote share, which seats can be calculated from
  votes?: number;
  // Wins seats from votes even below the electoral threshold
  isThresholdExempt?: boolean;
  // Supports the cabinet without joining it (gedoogsteun)
  isSupport?: boolean;
}
