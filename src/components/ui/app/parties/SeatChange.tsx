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

// A gain in green or a loss in red, e.g. "+6" or "−2". Nothing when 0.
export default function SeatChange({
  change,
  title,
  className = "",
}: {
  change: number;
  title?: string;
  className?: string;
}) {
  if (change === 0) return null;

  return (
    <span
      className={`text-xs font-semibold tabular-nums ${
        change > 0
          ? "text-green-600 dark:text-green-400"
          : "text-red-600 dark:text-red-400"
      } ${className}`}
      title={title}
    >
      {change > 0 ? `+${change}` : `−${-change}`}
    </span>
  );
}
