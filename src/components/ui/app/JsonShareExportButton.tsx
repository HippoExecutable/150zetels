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
  useI18n,
  useSelectedCountry,
  useCustomInfo,
  useMajorityThreshold,
  useAllowTieBreaker,
  useSortBy,
} from "@/lib/zustandStore";
import { stringifyCountry } from "@/utils/parseCountry";
import { createShareLink } from "@/utils/shareLink";
import {
  ArrowUpTrayIcon,
  CheckIcon,
  ChevronDownIcon,
  ClipboardDocumentIcon,
  DocumentArrowDownIcon,
  LinkIcon,
  PlusIcon,
} from "@heroicons/react/20/solid";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface IncludeOptions {
  selectedParties: boolean;
  majorityThreshold: boolean;
  sortBy: boolean;
  locale: boolean;
}

interface IncludeConfig {
  id: keyof IncludeOptions;
  label: string;
}

export default function JsonShareExportButton() {
  const { parties } = useParties();
  const { selectedParties } = useSelectedParties();
  const { selectedCountry } = useSelectedCountry();
  const { customInfo } = useCustomInfo();
  const { majorityThreshold } = useMajorityThreshold();
  const { allowTieBreaker } = useAllowTieBreaker();
  const { sortBy } = useSortBy();
  const { i, locale } = useI18n();
  const [includeOptions, setIncludeOptions] = useState<IncludeOptions>({
    selectedParties: true,
    majorityThreshold: true,
    sortBy: true,
    // Off by default, since it changes the language of whoever opens the data
    locale: false,
  });
  const { name, updateDate } = selectedCountry ?? customInfo;
  const country = {
    name,
    updateDate,
    parties,
    selectedParties: includeOptions.selectedParties ? selectedParties : parties,
    majorityThreshold: includeOptions.majorityThreshold
      ? majorityThreshold
      : undefined,
    allowTieBreaker: includeOptions.majorityThreshold
      ? allowTieBreaker
      : undefined,
    sortBy: includeOptions.sortBy ? sortBy : undefined,
    locale: includeOptions.locale ? locale : undefined,
  };
  const includeConfigurations: IncludeConfig[] = [
    { id: "selectedParties", label: i("buttons.selectedParties") },
    { id: "majorityThreshold", label: i("body.majorityThreshold") },
    { id: "sortBy", label: i("buttons.sortOrder") },
    { id: "locale", label: i("buttons.language") },
  ];
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      dropdownRef.current.focus();
    }
  }, [isOpen]);

  const handleFileExport = () => {
    const shouldExport = window.confirm(i("dialogs.exportDataConfirm"));

    if (!shouldExport) return;

    const data = stringifyCountry(country);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "parties.json";
    a.click();

    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const handleTextExport = async () => {
    try {
      await navigator.clipboard.writeText(stringifyCountry(country));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Error copying JSON text:", error);
      alert(i("dialogs.copyDataFailed"));
    }
  };

  const handleLinkExport = async () => {
    try {
      await navigator.clipboard.writeText(
        await createShareLink(country, window.location.href),
      );
      setIsLinkCopied(true);
      setTimeout(() => setIsLinkCopied(false), 2000);
    } catch (error) {
      console.error("Error copying share link:", error);
      alert(i("dialogs.copyDataFailed"));
    }
  };

  return (
    <div
      className="relative w-full flex-1"
      tabIndex={-1}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsOpen(false);
        }
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full rounded-full border-2 border-transparent px-3 py-1 text-nowrap transition-colors hover:bg-zinc-700 hover:text-white dark:hover:bg-zinc-200 dark:hover:text-zinc-950 ${
          isOpen
            ? "bg-zinc-700 text-white dark:bg-zinc-200 dark:text-zinc-950"
            : "bg-white dark:bg-zinc-900"
        }`}
        type="button"
        title="Export Parties"
        aria-label="Export Parties"
        aria-expanded={isOpen}
      >
        <span className="line-clamp-1 flex items-center justify-center gap-1 text-nowrap">
          <ArrowUpTrayIcon className="size-5 shrink-0" />
          {i("buttons.exportParties")}
          <ChevronDownIcon
            className={`size-5 shrink-0 transition-transform duration-300 ${isOpen ? "" : "rotate-180"}`}
          />
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="modal"
              transition={{
                duration: 0.3,
              }}
              initial={{ opacity: 0, translateY: 2 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: 2 }}
              ref={dropdownRef}
              tabIndex={-1}
              className="absolute end-0 bottom-full z-100 mb-2 w-full min-w-72 overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white shadow-xl outline-hidden dark:border-zinc-700 dark:bg-zinc-900"
            >
              <ul>
                <li className="flex flex-col gap-1 p-2">
                  <span className="text-sm opacity-75">
                    {i("buttons.include")}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {includeConfigurations.map((includeConfig) => (
                      <button
                        key={includeConfig.id}
                        onClick={() =>
                          setIncludeOptions({
                            ...includeOptions,
                            [includeConfig.id]:
                              !includeOptions[includeConfig.id],
                          })
                        }
                        className={`flex items-center gap-1 rounded-full border-2 border-transparent py-0.5 ps-2 pe-3 text-sm text-nowrap transition-colors duration-300 ${
                          includeOptions[includeConfig.id]
                            ? "bg-zinc-700 text-white dark:bg-zinc-200 dark:text-zinc-950"
                            : "bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600"
                        }`}
                        type="button"
                        aria-pressed={includeOptions[includeConfig.id]}
                      >
                        {includeOptions[includeConfig.id] ? (
                          <CheckIcon className="size-4 shrink-0" />
                        ) : (
                          <PlusIcon className="size-4 shrink-0" />
                        )}
                        {includeConfig.label}
                      </button>
                    ))}
                  </div>
                </li>
                <li className="border-t-2 border-zinc-200 transition-colors duration-300 hover:bg-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-700">
                  <button
                    onClick={handleFileExport}
                    className="flex w-full items-center gap-2 p-2 text-start"
                    type="button"
                  >
                    <DocumentArrowDownIcon className="size-5 shrink-0" />
                    <span>{i("buttons.exportToFile")}</span>
                  </button>
                </li>
                <li className="border-t-2 border-zinc-200 transition-colors duration-300 hover:bg-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-700">
                  <button
                    onClick={handleTextExport}
                    className="flex w-full items-center gap-2 p-2 text-start"
                    type="button"
                  >
                    {isCopied ? (
                      <CheckIcon className="size-5 shrink-0" />
                    ) : (
                      <ClipboardDocumentIcon className="size-5 shrink-0" />
                    )}
                    <span>
                      {isCopied
                        ? i("buttons.copied")
                        : i("buttons.exportToText")}
                    </span>
                  </button>
                </li>
                <li className="border-t-2 border-zinc-200 transition-colors duration-300 hover:bg-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-700">
                  <button
                    onClick={handleLinkExport}
                    className="flex w-full items-center gap-2 p-2 text-start"
                    type="button"
                  >
                    {isLinkCopied ? (
                      <CheckIcon className="size-5 shrink-0" />
                    ) : (
                      <LinkIcon className="size-5 shrink-0" />
                    )}
                    <span>
                      {isLinkCopied
                        ? i("buttons.copied")
                        : i("buttons.exportToLink")}
                    </span>
                  </button>
                </li>
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
