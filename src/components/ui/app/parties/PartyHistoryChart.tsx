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

import { CabinetPeriod, HistoryPoint } from "@/data/partyInfo";
import { useI18n } from "@/lib/zustandStore";
import { useState } from "react";

export interface HistorySeries {
  key: string;
  shortName: string;
  colour: string;
  history: HistoryPoint[];
  // Seats in the Tweede Kamer today and in the chosen poll, shown
  // in their own columns after the elections. Only given for the party itself.
  currentSeats?: number | null;
  pollSeats?: number | null;
  // When the party was in the cabinet, shaded behind the lines. Only given
  // for the party itself.
  cabinets?: CabinetPeriod[];
}

interface Column {
  x: number;
  // To look up the cabinet at the time, left out for polls
  date?: string;
  label: string;
  // Shown under the label, e.g. the size of the House at that election
  note?: string;
  values: { series: HistorySeries; seats: number }[];
}

const width = 600;
const plotHeight = 200;
const margin = { top: 24, right: 12, left: 64 };
// The "now" and "poll" columns get a fixed width, so they stay readable
// however long the party has been around
const extraColumnWidth = 44;
const extraGap = 20;
const stripHeight = 8;
const stripGap = 4;
const axisHeight = 22;
// The House grew from 100 to 150 seats at this election
const houseGrowth = "1956-06-13";

// Election dates as fractional years, so 1981 and 1982 do not overlap
function toYear(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return year + ((month - 1) * 30.4 + day) / 366;
}

// The elections from the first to the last one the party won seats at
function seatedRange(history: HistoryPoint[]) {
  const first = history.findIndex((point) => point.seats > 0);
  let last = history.length - 1;
  while (last > first && history[last].seats <= 0) last--;
  return first === -1 ? [] : history.slice(first, last + 1);
}

export default function PartyHistoryChart({
  series,
  pollName,
}: {
  series: HistorySeries[];
  pollName: string;
}) {
  const { i } = useI18n();
  const [hovered, setHovered] = useState<number | null>(null);
  const main = series[0];
  const elections = main?.history ?? [];
  const latest = elections[elections.length - 1];

  // Periods in parliament: from an election with seats to the next election,
  // or to now after the last one. Terms in a row are joined into one.
  const periods = series.map((s) =>
    s.history.reduce<[number, number | "now"][]>((acc, point, index) => {
      if (point.seats <= 0) return acc;
      const next = s.history[index + 1];
      if (!next && s.currentSeats === 0) return acc;
      const from = toYear(point.date);
      const to = next ? toYear(next.date) : "now";
      const previous = acc[acc.length - 1];
      if (previous && previous[1] === from) previous[1] = to;
      else acc.push([from, to]);
      return acc;
    }, []),
  );
  const allPeriods = periods.flat();
  if (!main || allPeriods.length === 0) {
    return <p className="text-sm opacity-75">{i("partyInfo.noHistory")}</p>;
  }

  const hasExtras = !!main.currentSeats || !!main.pollSeats || latest.seats > 0;
  const plotRight = width - margin.right;
  const mainRight = hasExtras
    ? plotRight - extraGap - 2 * extraColumnWidth
    : plotRight;
  const nowX = mainRight + extraGap + extraColumnWidth / 2;
  const pollX = nowX + extraColumnWidth;

  const start = Math.min(...allPeriods.map(([from]) => from)) - 1;
  const end =
    Math.max(
      ...allPeriods.map(([, to]) => (to === "now" ? 0 : to)),
      ...allPeriods.map(([from]) => from),
      hasExtras ? toYear(latest.date) : 0,
      start + 8,
    ) + 1;
  const x = (year: number) =>
    margin.left + ((year - start) / (end - start)) * (mainRight - margin.left);
  const xTo = (to: number | "now") => (to === "now" ? nowX : x(to));

  // Shading for the cabinets the party was in, clamped to the plot
  const today = new Date().toISOString().slice(0, 10);
  const cabinetBands = (main.cabinets ?? []).map((cabinet) => {
    const left = Math.max(x(toYear(cabinet.from)), margin.left);
    const right = cabinet.to
      ? Math.min(x(toYear(cabinet.to)), mainRight)
      : hasExtras
        ? nowX
        : mainRight;
    return { cabinet, left, width: Math.max(right - left, 0) };
  });
  const hasSupport = cabinetBands.some((band) => band.cabinet.isSupport);
  const cabinetAt = (date: string) =>
    main.cabinets?.find(
      (cabinet) => cabinet.from <= date && (!cabinet.to || date < cabinet.to),
    );

  const maxSeats = Math.max(
    ...series.flatMap((s) => [
      ...s.history.map((point) => point.seats),
      s.currentSeats ?? 0,
      s.pollSeats ?? 0,
    ]),
  );
  const step = maxSeats > 40 ? 20 : maxSeats > 20 ? 10 : maxSeats > 8 ? 5 : 2;
  const yMax = Math.max(step, Math.ceil(maxSeats / step) * step);
  const y = (seats: number) =>
    margin.top + plotHeight - (seats / yMax) * plotHeight;
  const yTicks = Array.from({ length: yMax / step + 1 }, (_, n) => n * step);

  const firstDecade = Math.ceil(start / 10) * 10;
  const decadeStep = end - start > 50 ? 20 : 10;
  const xTicks = Array.from(
    { length: Math.floor((end - firstDecade) / decadeStep) + 1 },
    (_, n) => firstDecade + n * decadeStep,
  );
  const growthX =
    toYear(houseGrowth) > start && toYear(houseGrowth) < end
      ? x(toYear(houseGrowth))
      : null;

  const axisY = margin.top + plotHeight;
  const stripsTop = axisY + axisHeight + 14;
  const height =
    stripsTop + series.length * (stripHeight + stripGap) + stripGap;

  // Everything the pointer can snap to, from left to right
  const columns: Column[] = elections
    .map((point, index) => ({
      x: x(toYear(point.date)),
      date: point.date,
      label: String(point.year),
      note: i("partyInfo.ofSeats").replace("{count}", String(point.totalSeats)),
      values: series
        .map((s) => ({ series: s, seats: s.history[index].seats }))
        .filter((value) => value.seats > 0),
    }))
    .filter((column) => column.values.length > 0);
  if (hasExtras) {
    columns.push(
      {
        x: nowX,
        date: today,
        label: i("partyInfo.nowTweedeKamer"),
        values: [{ series: main, seats: main.currentSeats ?? 0 }],
      },
      {
        x: pollX,
        label: pollName,
        values: [{ series: main, seats: main.pollSeats ?? 0 }],
      },
    );
  }
  const active = hovered === null ? null : columns[hovered];
  const activeCabinet = active?.date ? cabinetAt(active.date) : undefined;

  const seated = seatedRange(main.history);
  const linksToNow = hasExtras && seated[seated.length - 1] === latest;

  function snap(event: React.PointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const pointerX = ((event.clientX - rect.left) / rect.width) * width;
    let closest = 0;
    columns.forEach((column, index) => {
      if (
        Math.abs(column.x - pointerX) < Math.abs(columns[closest].x - pointerX)
      ) {
        closest = index;
      }
    });
    setHovered(closest);
  }

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full touch-pan-y text-zinc-950 select-none dark:text-white"
        role="img"
        aria-label={i("partyInfo.history")}
        onPointerMove={snap}
        onPointerDown={snap}
        onPointerLeave={() => setHovered(null)}
      >
        {/* Grid and axes */}
        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={margin.left}
              x2={plotRight}
              y1={y(tick)}
              y2={y(tick)}
              stroke="currentColor"
              strokeOpacity={tick === 0 ? 0.4 : 0.1}
            />
            <text
              x={margin.left - 6}
              y={y(tick)}
              dy="0.32em"
              textAnchor="end"
              fontSize={11}
              fill="currentColor"
              fillOpacity={0.6}
            >
              {tick}
            </text>
          </g>
        ))}
        {xTicks.map((tick) => (
          <text
            key={tick}
            x={x(tick)}
            y={axisY + 16}
            textAnchor="middle"
            fontSize={11}
            fill="currentColor"
            fillOpacity={0.6}
          >
            {tick}
          </text>
        ))}

        {/* Cabinets, with stripes for gedoogsteun */}
        <defs>
          <pattern
            id={`support-${main.key}`}
            width={6}
            height={6}
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect
              width={2.5}
              height={6}
              fill="currentColor"
              fillOpacity={0.14}
            />
          </pattern>
        </defs>
        {cabinetBands.map(({ cabinet, left, width: bandWidth }) => (
          <rect
            key={cabinet.name}
            x={left}
            y={margin.top}
            width={bandWidth}
            height={plotHeight}
            fill={
              cabinet.isSupport ? `url(#support-${main.key})` : "currentColor"
            }
            fillOpacity={cabinet.isSupport ? 1 : 0.08}
          />
        ))}

        {growthX !== null && (
          <g>
            <line
              x1={growthX}
              x2={growthX}
              y1={margin.top - 6}
              y2={axisY}
              stroke="currentColor"
              strokeOpacity={0.3}
              strokeDasharray="2 3"
            />
            <text
              x={growthX + 4}
              y={margin.top - 10}
              fontSize={10}
              fill="currentColor"
              fillOpacity={0.6}
            >
              {i("partyInfo.houseGrowth")}
            </text>
          </g>
        )}

        {hasExtras && (
          <g>
            <line
              x1={mainRight + extraGap / 2}
              x2={mainRight + extraGap / 2}
              y1={margin.top}
              y2={axisY + 20}
              stroke="currentColor"
              strokeOpacity={0.2}
            />
            {[
              [nowX, i("partyInfo.now")],
              [pollX, i("partyInfo.poll")],
            ].map(([columnX, label]) => (
              <text
                key={label}
                x={columnX}
                y={axisY + 16}
                textAnchor="middle"
                fontSize={11}
                fill="currentColor"
                fillOpacity={0.6}
              >
                {label}
              </text>
            ))}
          </g>
        )}

        {active && (
          <line
            x1={active.x}
            x2={active.x}
            y1={margin.top}
            y2={axisY}
            stroke="currentColor"
            strokeOpacity={0.35}
          />
        )}

        {/* Lines, oldest parties first so the party itself is drawn on top */}
        {[...series].reverse().map((s) => {
          // The first series is the party itself, the others merged into it
          const isMain = s === main;
          const points = seatedRange(s.history);
          return (
            <g key={s.key}>
              <polyline
                fill="none"
                stroke={s.colour}
                strokeWidth={isMain ? 3 : 2}
                strokeOpacity={isMain ? 1 : 0.7}
                strokeLinejoin="round"
                points={points
                  .map((p) => `${x(toYear(p.date))},${y(p.seats)}`)
                  .join(" ")}
              />
              {points.map((p) => {
                const isActive = active?.label === String(p.year);
                return (
                  <circle
                    key={p.date}
                    cx={x(toYear(p.date))}
                    cy={y(p.seats)}
                    r={(isMain ? 3.5 : 2.5) + (isActive ? 2 : 0)}
                    fill={s.colour}
                    fillOpacity={isMain || isActive ? 1 : 0.7}
                  />
                );
              })}
            </g>
          );
        })}

        {/* Now and the latest poll */}
        {hasExtras && (
          <g>
            <polyline
              fill="none"
              stroke={main.colour}
              strokeWidth={2}
              strokeDasharray="4 3"
              points={[
                ...(linksToNow
                  ? [`${x(toYear(latest.date))},${y(latest.seats)}`]
                  : []),
                `${nowX},${y(main.currentSeats ?? 0)}`,
                `${pollX},${y(main.pollSeats ?? 0)}`,
              ].join(" ")}
            />
            {[
              [nowX, main.currentSeats ?? 0],
              [pollX, main.pollSeats ?? 0],
            ].map(([columnX, seats]) => (
              <circle
                key={columnX}
                cx={columnX}
                cy={y(seats)}
                r={active?.x === columnX ? 6 : 4.5}
                className="fill-white dark:fill-zinc-900"
                stroke={main.colour}
                strokeWidth={2.5}
              />
            ))}
          </g>
        )}

        {/* When each party was in the Tweede Kamer */}
        <text
          x={margin.left}
          y={stripsTop - 6}
          fontSize={11}
          fill="currentColor"
          fillOpacity={0.6}
        >
          {i("partyInfo.inParliament")}
        </text>
        {series.map((s, index) => {
          const top = stripsTop + index * (stripHeight + stripGap);
          return (
            <g key={s.key}>
              <text
                x={margin.left - 6}
                y={top + stripHeight / 2}
                dy="0.32em"
                textAnchor="end"
                fontSize={10}
                fill="currentColor"
                fillOpacity={0.75}
              >
                {s.shortName}
              </text>
              <rect
                x={margin.left}
                y={top}
                width={(hasExtras ? nowX : mainRight) - margin.left}
                height={stripHeight}
                rx={stripHeight / 2}
                fill="currentColor"
                fillOpacity={0.06}
              />
              {periods[index].map(([from, to]) => (
                <rect
                  key={from}
                  x={x(from)}
                  y={top}
                  width={Math.max(xTo(to) - x(from), 2)}
                  height={stripHeight}
                  rx={stripHeight / 2}
                  fill={s.colour}
                />
              ))}
            </g>
          );
        })}
      </svg>
      {cabinetBands.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 ps-[10.7%] text-xs opacity-75">
          <span className="flex items-center gap-1.5">
            <span
              className="h-3 w-4 rounded-sm"
              style={{ backgroundColor: "currentColor", opacity: 0.15 }}
            ></span>
            {i("partyInfo.cabinetLegend")}
          </span>
          {hasSupport && (
            <span className="flex items-center gap-1.5">
              <span
                className="h-3 w-4 rounded-sm"
                style={{
                  background:
                    "repeating-linear-gradient(45deg, currentColor 0 2px, transparent 2px 5px)",
                  opacity: 0.3,
                }}
              ></span>
              {i("partyInfo.supportLegend")}
            </span>
          )}
        </div>
      )}

      {active && (
        <div
          className="pointer-events-none absolute top-0 z-10 rounded-xl border-2 border-zinc-200 bg-white px-2.5 py-1.5 text-sm text-nowrap shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
          style={{
            left: `${(active.x / width) * 100}%`,
            transform:
              active.x > width * 0.55
                ? "translateX(calc(-100% - 10px))"
                : "translateX(10px)",
          }}
        >
          <p className="font-semibold">{active.label}</p>
          {active.note && <p className="text-xs opacity-60">{active.note}</p>}
          {activeCabinet && (
            <p className="text-xs opacity-60">
              {i(
                activeCabinet.isSupport
                  ? "partyInfo.supportingCabinet"
                  : "partyInfo.inCabinet",
              ).replace("{cabinet}", activeCabinet.name)}
            </p>
          )}
          <ul className="mt-1">
            {[...active.values]
              .sort((a, b) => b.seats - a.seats)
              .map(({ series: s, seats }) => (
                <li key={s.key} className="flex items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: s.colour }}
                  ></span>
                  <span className="flex-1">{s.shortName}</span>
                  <span className="font-semibold tabular-nums">{seats}</span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
