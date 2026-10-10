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

import { useEffect, useRef, useState } from "react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/16/solid";
import { PartyButton, PieChart, SeatsGraph } from "@/components/ui/app";
import {
  useParties,
  useSelectedParties,
  useSelectedCountry,
  useCustomInfo,
  useMajorityThreshold,
  useAllowTieBreaker,
  useSortBy,
  useI18n,
  exportCountryData,
} from "@/lib/zustandStore";
import { getCountryTitle } from "@/utils/countryTitle";
import { createShareLink, embedHeightMessage } from "@/utils/shareLink";
import { sort } from "@/utils/sort";

export default function Embed({
  isShareLinkInvalid,
}: {
  isShareLinkInvalid: boolean;
}) {
  const { parties } = useParties();
  const { selectedParties } = useSelectedParties();
  const { selectedCountry } = useSelectedCountry();
  const { customInfo } = useCustomInfo();
  const { majorityThreshold } = useMajorityThreshold();
  const { allowTieBreaker } = useAllowTieBreaker();
  const { sortBy } = useSortBy();
  const { i } = useI18n();
  const [fullVersionLink, setFullVersionLink] = useState<string>();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { title, subtitle } = getCountryTitle(selectedCountry, customInfo, i);

  // Opens the full app with whatever the reader has changed here
  useEffect(() => {
    let isCancelled = false;

    createShareLink(
      exportCountryData({
        selectedParties: true,
        majorityThreshold: true,
        sortBy: true,
        locale: false,
      }),
      window.location.href,
    ).then((link) => {
      if (!isCancelled) setFullVersionLink(link);
    });

    return () => {
      isCancelled = true;
    };
  }, [
    parties,
    selectedParties,
    selectedCountry,
    customInfo,
    majorityThreshold,
    allowTieBreaker,
    sortBy,
  ]);

  // Lets the embed code fit the iframe to the content
  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.parent === window) return;

    const observer = new ResizeObserver(() => {
      window.parent.postMessage(
        {
          type: embedHeightMessage,
          height: Math.ceil(root.getBoundingClientRect().height),
        },
        "*",
      );
    });

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="p-4">
      {isShareLinkInvalid ? (
        <p className="text-center opacity-75">{i("embed.invalidData")}</p>
      ) : (
        <>
          {(title || subtitle) && (
            <div className="mb-4">
              {title && <h1 className="text-lg font-semibold">{title}</h1>}
              {subtitle && <p className="text-xs opacity-75">{subtitle}</p>}
            </div>
          )}
          <div className="relative aspect-2/1 w-full">
            <PieChart
              parties={parties}
              selectedParties={[...selectedParties]}
              isEditMode={false}
              sortBy={sortBy}
              majorityThreshold={majorityThreshold}
            />
          </div>
          <SeatsGraph />
          <ul className="xs:grid-cols-2 grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {[...parties]
              .sort((a, b) => sort(a, b, false, sortBy))
              .map((party) => (
                <li key={party.id}>
                  <PartyButton party={party} />
                </li>
              ))}
          </ul>
          {fullVersionLink && (
            <a
              href={fullVersionLink}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-4 flex items-center justify-end gap-1 text-sm opacity-75 hover:underline"
            >
              {i("embed.openFullVersion")}
              <ArrowTopRightOnSquareIcon className="size-4 shrink-0" />
            </a>
          )}
        </>
      )}
    </div>
  );
}
