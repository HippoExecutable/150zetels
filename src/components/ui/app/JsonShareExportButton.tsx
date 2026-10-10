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

import { useI18n, exportCountryData } from "@/lib/zustandStore";
import { IncludeOptions } from "@/types";
import { copyText } from "@/utils/clipboard";
import { stringifyCountry } from "@/utils/parseCountry";
import {
  createEmbedCode,
  createEmbedLink,
  createShareLink,
} from "@/utils/shareLink";
import ExportImagePanel from "./ExportImagePanel";
import {
  ArrowUpTrayIcon,
  CheckIcon,
  ChevronDownIcon,
  ClipboardDocumentIcon,
  CodeBracketIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
  LinkIcon,
  PhotoIcon,
  PlusIcon,
} from "@heroicons/react/20/solid";
import { AnimatePresence, motion } from "motion/react";
import { ReactNode, useEffect, useRef, useState } from "react";

interface IncludeConfig {
  id: keyof IncludeOptions;
  label: string;
}

interface TabConfig {
  id: "data" | "image";
  label: string;
  icon: ReactNode;
}

interface ActionConfig {
  id: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
}

export default function JsonShareExportButton() {
  const { i } = useI18n();
  const [includeOptions, setIncludeOptions] = useState<IncludeOptions>({
    selectedParties: true,
    majorityThreshold: true,
    sortBy: true,
    // Off by default, since it changes the language of whoever opens the data
    locale: false,
  });
  const [tab, setTab] = useState<TabConfig["id"]>("data");
  const [isOpen, setIsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      dropdownRef.current.focus();
    }
  }, [isOpen]);

  const includeConfigurations: IncludeConfig[] = [
    { id: "selectedParties", label: i("buttons.selectedParties") },
    { id: "majorityThreshold", label: i("body.majorityThreshold") },
    { id: "sortBy", label: i("buttons.sortOrder") },
    { id: "locale", label: i("buttons.language") },
  ];

  const tabConfigurations: TabConfig[] = [
    {
      id: "data",
      label: i("buttons.data"),
      icon: <DocumentTextIcon className="size-4 shrink-0" />,
    },
    {
      id: "image",
      label: i("buttons.image"),
      icon: <PhotoIcon className="size-4 shrink-0" />,
    },
  ];

  const handleFileExport = () => {
    const shouldExport = window.confirm(i("dialogs.exportDataConfirm"));

    if (!shouldExport) return;

    const data = stringifyCountry(exportCountryData(includeOptions));
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "parties.json";
    a.click();

    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  // The text is passed as a promise, so Safari still sees it as part of the click
  const handleCopy = async (id: string, text: Promise<string>) => {
    try {
      await copyText(text);
      setCopiedId(id);
      setTimeout(
        () => setCopiedId((current) => (current === id ? null : current)),
        2000,
      );
    } catch (error) {
      console.error("Error copying export:", error);
      alert(i("dialogs.copyDataFailed"));
    }
  };

  const actionConfigurations: ActionConfig[] = [
    {
      id: "file",
      label: i("buttons.exportToFile"),
      icon: <DocumentArrowDownIcon className="size-5 shrink-0" />,
      onClick: handleFileExport,
    },
    {
      id: "text",
      label: i("buttons.exportToText"),
      icon: <ClipboardDocumentIcon className="size-5 shrink-0" />,
      onClick: () =>
        handleCopy(
          "text",
          Promise.resolve(stringifyCountry(exportCountryData(includeOptions))),
        ),
    },
    {
      id: "link",
      label: i("buttons.exportToLink"),
      icon: <LinkIcon className="size-5 shrink-0" />,
      onClick: () =>
        handleCopy(
          "link",
          createShareLink(
            exportCountryData(includeOptions),
            window.location.href,
          ),
        ),
    },
    {
      id: "embed",
      label: i("buttons.exportToEmbed"),
      icon: <CodeBracketIcon className="size-5 shrink-0" />,
      onClick: () => {
        const country = exportCountryData(includeOptions);
        handleCopy(
          "embed",
          createEmbedLink(country, window.location.href).then((embedLink) =>
            createEmbedCode(embedLink, country),
          ),
        );
      },
    },
  ];

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
              className="absolute inset-e-0 bottom-full z-100 mb-2 w-full min-w-72 overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white shadow-xl outline-hidden dark:border-zinc-700 dark:bg-zinc-900"
            >
              <div className="p-2">
                <div className="relative flex overflow-hidden rounded-full border-2 border-transparent bg-zinc-200 dark:bg-zinc-700">
                  <div
                    className={`absolute top-0 left-0 z-2 h-full w-1/2 rounded-full bg-zinc-700 transition-transform duration-300 dark:bg-zinc-200 ${
                      tab === "image" ? "translate-x-full" : "translate-x-0"
                    }`}
                  ></div>
                  {tabConfigurations.map((tabConfig) => (
                    <button
                      key={tabConfig.id}
                      onClick={() => setTab(tabConfig.id)}
                      className={`${
                        tab === tabConfig.id
                          ? "text-white dark:text-zinc-950"
                          : ""
                      } z-4 flex flex-1 items-center justify-center gap-1 px-3 py-0.75 text-sm transition-colors duration-300`}
                      type="button"
                      aria-pressed={tab === tabConfig.id}
                    >
                      {tabConfig.icon}
                      {tabConfig.label}
                    </button>
                  ))}
                </div>
              </div>
              {tab === "image" ? (
                <ExportImagePanel />
              ) : (
                <ul>
                  <li className="flex flex-col gap-1 border-t-2 border-zinc-200 p-2 dark:border-zinc-700">
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
                  {actionConfigurations.map((actionConfig) => (
                    <li
                      key={actionConfig.id}
                      className="border-t-2 border-zinc-200 transition-colors duration-300 hover:bg-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-700"
                    >
                      <button
                        onClick={actionConfig.onClick}
                        className="flex w-full items-center gap-2 p-2 text-start"
                        type="button"
                      >
                        {copiedId === actionConfig.id ? (
                          <CheckIcon className="size-5 shrink-0" />
                        ) : (
                          actionConfig.icon
                        )}
                        <span>
                          {copiedId === actionConfig.id
                            ? i("buttons.copied")
                            : actionConfig.label}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
