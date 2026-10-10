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
  useParties,
  useSelectedParties,
  useSelectedCountry,
  useCustomInfo,
  useMajorityThreshold,
  useAllowTieBreaker,
  useSortBy,
  useI18n,
} from "@/lib/zustandStore";
import { canCopyImage, copyImage } from "@/utils/clipboard";
import { getCountryTitle } from "@/utils/countryTitle";
import {
  ImageContent,
  ImageFormat,
  canvasToBlob,
  drawImage,
  getImageFileName,
} from "@/utils/drawImage";
import { getMajority } from "@/utils/getMajority";
import { pluralize } from "@/utils/pluralize";
import { sort } from "@/utils/sort";
import {
  CheckIcon,
  ClipboardDocumentIcon,
  PhotoIcon,
} from "@heroicons/react/20/solid";
import { useEffect, useRef, useState } from "react";

interface FormatConfig {
  id: ImageFormat;
  label: string;
  ratio: string;
  // Outline of the image shape, drawn next to the label
  shapeClassName: string;
}

export default function ExportImagePanel() {
  const { parties } = useParties();
  const { selectedParties } = useSelectedParties();
  const { selectedCountry } = useSelectedCountry();
  const { customInfo } = useCustomInfo();
  const { majorityThreshold } = useMajorityThreshold();
  const { allowTieBreaker } = useAllowTieBreaker();
  const { sortBy } = useSortBy();
  const { i } = useI18n();
  const [format, setFormat] = useState<ImageFormat>("square");
  const [isCopied, setIsCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const formatConfigurations: FormatConfig[] = [
    {
      id: "square",
      label: i("buttons.square"),
      ratio: "1:1",
      shapeClassName: "size-3",
    },
    {
      id: "portrait",
      label: i("buttons.portrait"),
      ratio: "4:5",
      shapeClassName: "h-3 w-2.5",
    },
    {
      id: "vertical",
      label: i("buttons.vertical"),
      ratio: "9:16",
      shapeClassName: "h-3.5 w-2",
    },
    {
      id: "wide",
      label: i("buttons.wide"),
      ratio: "16:9",
      shapeClassName: "h-2.5 w-3.5",
    },
  ];

  const total = parties.reduce((acc, party) => acc + party.seats, 0);
  const selectedTotal = selectedParties.reduce(
    (acc, party) => acc + party.seats,
    0,
  );
  const majority = getMajority(
    total,
    selectedTotal,
    allowTieBreaker,
    majorityThreshold,
  );
  const margin = pluralize(
    majority.margin,
    i("header.seat"),
    i("header.seats"),
  );
  const { title, subtitle } = getCountryTitle(selectedCountry, customInfo, i);
  const content: ImageContent = {
    title,
    subtitle,
    parties: [...parties].sort((a, b) => sort(a, b, false, sortBy)),
    selectedParties: [...selectedParties].sort((a, b) =>
      sort(a, b, false, sortBy),
    ),
    selectedTotal,
    total,
    thresholdFraction:
      majorityThreshold.numerator / majorityThreshold.denominator,
    // Same wording as the seats graph
    statusText:
      majority.status === "tie-breaking majority"
        ? i("header.tieBreakingMajority")
        : majority.status === "majority"
          ? `${margin} ${i("header.majority")}`
          : majority.status === "minority"
            ? `${margin} ${i("header.left")}`
            : "",
    isMajority:
      majority.status === "majority" ||
      majority.status === "tie-breaking majority",
    majorityText: i("header.seatsForMajority").replace(
      "{count}",
      majority.seatsForMajority.toString(),
    ),
    footer: window.location.host,
  };

  // Redraws the preview, which is also the image that gets saved
  useEffect(() => {
    if (!canvasRef.current) return;

    drawImage(canvasRef.current, format, content, {
      isDarkMode: document.documentElement.classList.contains("dark"),
      fontFamily: getComputedStyle(document.body).fontFamily,
    });
  });

  const handleDownload = () => {
    if (!canvasRef.current) return;

    const a = document.createElement("a");
    a.href = canvasRef.current.toDataURL("image/png");
    a.download = getImageFileName(title, format);
    a.click();
  };

  const handleCopy = async () => {
    if (!canvasRef.current) return;

    try {
      await copyImage(canvasToBlob(canvasRef.current));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Error copying image:", error);
      alert(i("dialogs.copyDataFailed"));
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2 border-t-2 border-zinc-200 p-2 dark:border-zinc-700">
        <div className="flex flex-col gap-1">
          <span className="text-sm opacity-75">{i("buttons.format")}</span>
          <div className="flex flex-wrap gap-2">
            {formatConfigurations.map((formatConfig) => (
              <button
                key={formatConfig.id}
                onClick={() => setFormat(formatConfig.id)}
                className={`flex items-center gap-1.5 rounded-full border-2 border-transparent py-0.5 ps-2.5 pe-3 text-sm text-nowrap transition-colors duration-300 ${
                  format === formatConfig.id
                    ? "bg-zinc-700 text-white dark:bg-zinc-200 dark:text-zinc-950"
                    : "bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600"
                }`}
                type="button"
                aria-pressed={format === formatConfig.id}
              >
                <span
                  className={`${formatConfig.shapeClassName} shrink-0 rounded-[2px] border-2 border-current`}
                ></span>
                {formatConfig.label}
                <span className="opacity-75">{formatConfig.ratio}</span>
              </button>
            ))}
          </div>
        </div>
        <canvas
          ref={canvasRef}
          className="mx-auto max-h-48 w-auto max-w-full rounded-lg border-2 border-zinc-200 dark:border-zinc-700"
          aria-label={i("buttons.image")}
          role="img"
        ></canvas>
      </div>
      <ul>
        <li className="border-t-2 border-zinc-200 transition-colors duration-300 hover:bg-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-700">
          <button
            onClick={handleDownload}
            className="flex w-full items-center gap-2 p-2 text-start"
            type="button"
          >
            <PhotoIcon className="size-5 shrink-0" />
            <span>{i("buttons.downloadImage")}</span>
          </button>
        </li>
        {canCopyImage && (
          <li className="border-t-2 border-zinc-200 transition-colors duration-300 hover:bg-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-700">
            <button
              onClick={handleCopy}
              className="flex w-full items-center gap-2 p-2 text-start"
              type="button"
            >
              {isCopied ? (
                <CheckIcon className="size-5 shrink-0" />
              ) : (
                <ClipboardDocumentIcon className="size-5 shrink-0" />
              )}
              <span>
                {isCopied ? i("buttons.copied") : i("buttons.copyImage")}
              </span>
            </button>
          </li>
        )}
      </ul>
    </>
  );
}
