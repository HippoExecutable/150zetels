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
  neutralColor,
  pieChartDarkColor,
  pieChartLightColor,
} from "@/components/colors";
import { Party } from "@/types";

export type ImageFormat = "square" | "vertical" | "wide";

export const imageSizes: Record<
  ImageFormat,
  { width: number; height: number }
> = {
  square: { width: 1080, height: 1080 },
  vertical: { width: 1080, height: 1920 },
  wide: { width: 1920, height: 1080 },
};

export interface ImageContent {
  title: string;
  subtitle: string;
  // In the order of the party list
  parties: Party[];
  // In the order of the half pie
  selectedParties: Party[];
  selectedTotal: number;
  total: number;
  thresholdFraction: number;
  statusText: string;
  isMajority: boolean;
  majorityText: string;
  footer: string;
}

export interface ImageStyle {
  isDarkMode: boolean;
  fontFamily: string;
}

export interface ArcSegment {
  colour: string;
  start: number;
  end: number;
}

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Matches the app's zinc, emerald, and rose colours
const palettes = {
  light: {
    background: "#ffffff",
    text: "#09090b",
    muted: "#71717a",
    empty: pieChartLightColor,
    majority: "#059669",
    minority: "#e11d48",
  },
  dark: {
    background: "#18181b",
    text: "#ffffff",
    muted: "#a1a1aa",
    empty: pieChartDarkColor,
    majority: "#34d399",
    minority: "#fb7185",
  },
};

type Palette = (typeof palettes)["light"];

// Same proportions as the half pie in the app
const innerRadiusRatio = 0.35;
// Room under the half pie for the three lines of numbers
const textHeightRatio = 0.42;

// Angles run clockwise from the left end of the half pie (π) to the right end (2π)
export function getArcSegments(
  selectedParties: Party[],
  total: number,
  emptyColour: string,
): ArcSegment[] {
  const segments: ArcSegment[] = [];
  let angle = Math.PI;

  if (total > 0) {
    for (const party of selectedParties) {
      const end = angle + (party.seats / total) * Math.PI;
      segments.push({ colour: party.colour, start: angle, end });
      angle = end;
    }
  }

  segments.push({ colour: emptyColour, start: angle, end: 2 * Math.PI });
  return segments.filter(({ start, end }) => end - start > 0);
}

export function getImageFileName(title: string, format: ImageFormat) {
  const slug = title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug || "parliament-seats"}-${format}.png`;
}

export function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Could not create the image")),
      "image/png",
    );
  });
}

function setFont(
  context: CanvasRenderingContext2D,
  weight: number,
  size: number,
  fontFamily: string,
) {
  context.font = `${weight} ${size}px ${fontFamily}`;
}

// Cuts by characters rather than UTF-16 units, so emoji are not split
function fitText(
  context: CanvasRenderingContext2D,
  text: string,
  width: number,
) {
  if (context.measureText(text).width <= width) return text;

  const characters = Array.from(text);
  while (
    characters.length > 0 &&
    context.measureText(`${characters.join("")}…`).width > width
  ) {
    characters.pop();
  }

  return `${characters.join("").trimEnd()}…`;
}

function getPartyLabel(party: Party) {
  if (party.isIndependent) {
    return party.shortName ? `${party.shortName} (I)` : "Independent";
  }
  return party.shortName || party.name;
}

function drawHalfPie(
  context: CanvasRenderingContext2D,
  box: Box,
  content: ImageContent,
  palette: Palette,
  fontFamily: string,
) {
  const radius = Math.min(box.width / 2, box.height / (1 + textHeightRatio));
  const innerRadius = radius * innerRadiusRatio;
  const centerX = box.x + box.width / 2;
  const centerY =
    box.y + (box.height - radius * (1 + textHeightRatio)) / 2 + radius;
  const segments = getArcSegments(
    content.selectedParties,
    content.total,
    palette.empty,
  );
  const pointAt = (angle: number, distance: number) =>
    [
      centerX + Math.cos(angle) * distance,
      centerY + Math.sin(angle) * distance,
    ] as const;

  for (const segment of segments) {
    context.beginPath();
    context.arc(centerX, centerY, radius, segment.start, segment.end);
    context.arc(
      centerX,
      centerY,
      innerRadius,
      segment.end,
      segment.start,
      true,
    );
    context.closePath();
    // Colours the canvas cannot read keep the neutral one
    context.fillStyle = neutralColor;
    context.fillStyle = segment.colour;
    context.fill();
  }

  // Thin seams between neighbouring parties, except next to slivers,
  // where the seams would crowd out the colours
  context.strokeStyle = palette.background;
  context.lineWidth = Math.max(2, radius * 0.006);
  const minSeamSpan = 0.02;
  segments.forEach((segment, index) => {
    const previous = segments[index - 1];
    if (
      !previous ||
      previous.end - previous.start < minSeamSpan ||
      segment.end - segment.start < minSeamSpan
    ) {
      return;
    }

    context.beginPath();
    context.moveTo(...pointAt(segment.start, innerRadius));
    context.lineTo(...pointAt(segment.start, radius));
    context.stroke();
  });

  // Dashed majority line, as in the app
  const thresholdAngle = Math.PI + content.thresholdFraction * Math.PI;
  context.strokeStyle = "#ffffff";
  context.lineWidth = Math.max(3, radius * 0.012);
  context.setLineDash([radius * 0.035, radius * 0.025]);
  context.beginPath();
  context.moveTo(...pointAt(thresholdAngle, innerRadius));
  context.lineTo(...pointAt(thresholdAngle, radius));
  context.stroke();
  context.setLineDash([]);

  // Coalition seats in the middle, shrunk to fit inside the hole
  const totalText = content.selectedTotal.toString();
  let numberSize = radius * 0.26;
  setFont(context, 700, numberSize, fontFamily);
  const numberWidth = context.measureText(totalText).width;
  if (numberWidth > innerRadius * 1.4) {
    numberSize *= (innerRadius * 1.4) / numberWidth;
    setFont(context, 700, numberSize, fontFamily);
  }
  context.textAlign = "center";
  context.textBaseline = "alphabetic";
  context.fillStyle = palette.text;
  context.fillText(totalText, centerX, centerY - radius * 0.03);

  const lineSize = Math.max(20, radius * 0.085);
  const lineHeight = lineSize * 1.4;
  const lines = [
    { text: `/ ${content.total}`, weight: 400, colour: palette.muted },
    {
      text: content.statusText,
      weight: 600,
      colour: content.isMajority ? palette.majority : palette.minority,
    },
    { text: content.majorityText, weight: 400, colour: palette.muted },
  ].filter(({ text }) => text);

  lines.forEach((line, index) => {
    setFont(context, line.weight, lineSize, fontFamily);
    context.fillStyle = line.colour;
    context.fillText(
      fitText(context, line.text, box.width),
      centerX,
      centerY + lineHeight * (index + 1),
    );
  });
}

interface LegendLayout {
  columns: number;
  rows: number;
  columnWidth: number;
  fontSize: number;
  rowHeight: number;
  width: number;
  height: number;
}

const legendSettings: Record<
  ImageFormat,
  { maxFontSize: number; columnsFor: (count: number) => number }
> = {
  square: { maxFontSize: 30, columnsFor: (count) => (count > 8 ? 3 : 2) },
  vertical: {
    maxFontSize: 40,
    columnsFor: (count) => (count > 24 ? 3 : count > 12 ? 2 : 1),
  },
  wide: { maxFontSize: 34, columnsFor: (count) => (count > 10 ? 2 : 1) },
};

// Long rows put the seats too far from the party names
const maxColumnWidth = 600;
const columnGap = 40;

function getLegendLayout(
  format: ImageFormat,
  count: number,
  maxWidth: number,
  maxHeight: number,
): LegendLayout {
  const { maxFontSize, columnsFor } = legendSettings[format];
  const columns = columnsFor(count);
  const rows = Math.ceil(count / columns);
  const columnWidth = Math.min(
    maxColumnWidth,
    (maxWidth - columnGap * (columns - 1)) / columns,
  );
  const fontSize = Math.max(
    16,
    Math.min(maxFontSize, maxHeight / Math.max(rows, 1) / 1.9),
  );
  const rowHeight = fontSize * 1.9;

  return {
    columns,
    rows,
    columnWidth,
    fontSize,
    rowHeight,
    width: columns * columnWidth + columnGap * (columns - 1),
    height: count === 0 ? 0 : rows * rowHeight,
  };
}

function drawLegend(
  context: CanvasRenderingContext2D,
  box: Box,
  layout: LegendLayout,
  content: ImageContent,
  palette: Palette,
  fontFamily: string,
) {
  const { columns, columnWidth, fontSize, rowHeight } = layout;
  const dotRadius = fontSize * 0.36;
  const gap = fontSize * 0.5;
  const selectedIds = new Set(content.selectedParties.map(({ id }) => id));
  // Centred in the box, in case the columns are narrower than it
  const left = box.x + (box.width - layout.width) / 2;
  const top = box.y + (box.height - layout.height) / 2;

  context.textBaseline = "middle";

  content.parties.forEach((party, index) => {
    const x = left + (index % columns) * (columnWidth + columnGap);
    const y = top + Math.floor(index / columns) * rowHeight + rowHeight / 2;

    // Parties outside the coalition fade out
    context.globalAlpha = selectedIds.has(party.id) ? 1 : 0.4;

    context.beginPath();
    context.arc(x + dotRadius, y, dotRadius, 0, 2 * Math.PI);
    context.fillStyle = neutralColor;
    context.fillStyle = party.colour;
    context.fill();
    // A faint ring keeps colours close to the background visible
    context.strokeStyle = palette.empty;
    context.lineWidth = 2;
    context.stroke();

    setFont(context, 700, fontSize, fontFamily);
    context.textAlign = "right";
    context.fillStyle = palette.text;
    const seats = party.seats.toString();
    const seatsWidth = context.measureText(seats).width;
    context.fillText(seats, x + columnWidth, y);

    setFont(context, 400, fontSize, fontFamily);
    context.textAlign = "left";
    const nameX = x + dotRadius * 2 + gap;
    context.fillText(
      fitText(
        context,
        getPartyLabel(party),
        x + columnWidth - seatsWidth - gap - nameX,
      ),
      nameX,
      y,
    );
  });

  context.globalAlpha = 1;
}

export function drawImage(
  canvas: HTMLCanvasElement,
  format: ImageFormat,
  content: ImageContent,
  style: ImageStyle,
) {
  const { width, height } = imageSizes[format];
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) return;

  const { fontFamily } = style;
  const palette = style.isDarkMode ? palettes.dark : palettes.light;
  const padding = 80;
  const gap = 48;
  const contentWidth = width - padding * 2;
  const titleSize = 64;
  const subtitleSize = 30;
  const footerSize = 26;

  context.fillStyle = palette.background;
  context.fillRect(0, 0, width, height);

  // Header
  let y = padding;
  context.textAlign = "left";
  context.textBaseline = "top";
  if (content.title) {
    setFont(context, 700, titleSize, fontFamily);
    context.fillStyle = palette.text;
    context.fillText(fitText(context, content.title, contentWidth), padding, y);
    y += titleSize * 1.25;
  }
  if (content.subtitle) {
    setFont(context, 400, subtitleSize, fontFamily);
    context.fillStyle = palette.muted;
    context.fillText(
      fitText(context, content.subtitle, contentWidth),
      padding,
      y,
    );
    y += subtitleSize * 1.3;
  }

  // Footer
  setFont(context, 400, footerSize, fontFamily);
  context.textBaseline = "alphabetic";
  context.fillStyle = palette.muted;
  context.fillText(content.footer, padding, height - padding);

  const top = y === padding ? padding : y + gap;
  const bottom = height - padding - footerSize - gap;
  const available = bottom - top;
  const count = content.parties.length;

  if (format === "wide") {
    const columnWidth = (contentWidth - gap * 2) / 2;
    drawHalfPie(
      context,
      { x: padding, y: top, width: columnWidth, height: available },
      content,
      palette,
      fontFamily,
    );
    drawLegend(
      context,
      {
        x: padding + columnWidth + gap * 2,
        y: top,
        width: columnWidth,
        height: available,
      },
      getLegendLayout(format, count, columnWidth, available),
      content,
      palette,
      fontFamily,
    );
    return;
  }

  // The legend may take up to a share of the room, and the half pie gets
  // the rest, up to the widest it can be
  const legendLayout = getLegendLayout(
    format,
    count,
    contentWidth,
    available * (format === "square" ? 0.4 : 0.5),
  );
  const legendHeight = legendLayout.height ? legendLayout.height + gap : 0;
  const chartHeight = Math.min(
    (contentWidth / 2) * (1 + textHeightRatio),
    available - legendHeight,
  );
  // Leftover room goes evenly above and below
  const chartTop = top + (available - chartHeight - legendHeight) / 2;

  drawHalfPie(
    context,
    { x: padding, y: chartTop, width: contentWidth, height: chartHeight },
    content,
    palette,
    fontFamily,
  );
  drawLegend(
    context,
    {
      x: padding,
      y: chartTop + chartHeight + gap,
      width: contentWidth,
      height: legendLayout.height,
    },
    legendLayout,
    content,
    palette,
    fontFamily,
  );
}
