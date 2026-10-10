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
  useSelectedParties,
  useParties,
  useSelectedCountry,
  useI18n,
  useCustomInfo,
} from "@/lib/zustandStore";
import { parseCountry } from "@/utils/parseCountry";
import {
  ArrowDownTrayIcon,
  ChevronDownIcon,
  ClipboardDocumentIcon,
  DocumentArrowUpIcon,
  DocumentTextIcon,
} from "@heroicons/react/20/solid";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

export default function JsonShareImportButton() {
  const { setParties } = useParties();
  const { setSelectedParties } = useSelectedParties();
  const { setSelectedCountry } = useSelectedCountry();
  const { setCustomInfo } = useCustomInfo();
  const { i } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      dropdownRef.current.focus();
    }
  }, [isOpen]);

  // Throws when the data is not JSON, and returns whether it was imported
  const importParties = (data: string) => {
    const parsedCountry = parseCountry(data);
    if (!parsedCountry) return false;

    const { name, updateDate, parties } = parsedCountry;
    setParties(parties);
    setSelectedParties(parties);
    setSelectedCountry(null);
    setCustomInfo({ name, updateDate });
    return true;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const data = readerEvent.target?.result;
      if (typeof data !== "string") return;

      try {
        if (!importParties(data)) {
          alert(i("dialogs.invalidImportFormat"));
        }
      } catch (error) {
        console.error("Error parsing JSON file:", error);
        alert(i("dialogs.invalidImportParse"));
      } finally {
        event.target.value = "";
      }
    };

    reader.readAsText(file);
  };

  const handleTextImport = () => {
    try {
      if (!importParties(importText)) {
        alert(i("dialogs.invalidImportTextFormat"));
        return;
      }

      setImportText("");
      setIsOpen(false);
    } catch (error) {
      console.error("Error parsing JSON text:", error);
      alert(i("dialogs.invalidImportTextParse"));
    }
  };

  const handleTextPaste = async () => {
    try {
      setImportText(await navigator.clipboard.readText());
    } catch (error) {
      console.error("Error pasting JSON text:", error);
      alert(i("dialogs.pasteDataFailed"));
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
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full rounded-full border-2 border-transparent px-3 py-1 text-nowrap transition-colors hover:bg-zinc-700 hover:text-white dark:hover:bg-zinc-200 dark:hover:text-zinc-950 ${
          isOpen
            ? "bg-zinc-700 text-white dark:bg-zinc-200 dark:text-zinc-950"
            : "bg-white dark:bg-zinc-900"
        }`}
        aria-expanded={isOpen}
      >
        <span className="line-clamp-1 flex items-center justify-center gap-1 text-nowrap">
          <ArrowDownTrayIcon className="size-5 shrink-0" />
          {i("buttons.importParties")}
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
              className="absolute bottom-full z-100 mb-2 w-full overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white shadow-xl outline-hidden dark:border-zinc-700 dark:bg-zinc-900"
            >
              <ul>
                <li className="transition-colors duration-300 hover:bg-zinc-200 dark:hover:bg-zinc-700">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      fileInputRef.current?.click();
                    }}
                    className="flex w-full items-center gap-2 p-2 text-start"
                    type="button"
                  >
                    <DocumentArrowUpIcon className="size-5 shrink-0" />
                    <span>{i("buttons.importFromFile")}</span>
                  </button>
                </li>
                <li className="flex flex-col gap-2 border-t-2 border-zinc-200 p-2 dark:border-zinc-700">
                  <label className="flex flex-col gap-2">
                    <span className="flex items-center gap-2">
                      <DocumentTextIcon className="size-5 shrink-0" />
                      {i("buttons.importFromText")}
                    </span>
                    <textarea
                      name="importText"
                      rows={4}
                      placeholder={i("body.pasteDataPlaceholder")}
                      spellCheck={false}
                      className="w-full resize-none rounded-lg border-2 border-zinc-200 bg-transparent p-2 font-mono outline-hidden transition-colors duration-300 focus:border-zinc-400 dark:border-zinc-700 dark:focus:border-zinc-500"
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleTextPaste}
                      className="w-full flex-1 rounded-full border-2 border-transparent bg-zinc-200 px-3 py-1 text-nowrap transition-colors hover:bg-zinc-700 hover:text-white dark:bg-zinc-700 dark:hover:bg-zinc-200 dark:hover:text-zinc-950"
                      type="button"
                    >
                      <span className="flex items-center justify-center gap-1">
                        <ClipboardDocumentIcon className="size-5 shrink-0" />
                        {i("buttons.paste")}
                      </span>
                    </button>
                    <button
                      onClick={handleTextImport}
                      disabled={!importText.trim()}
                      className="w-full flex-1 rounded-full border-2 border-transparent bg-zinc-200 px-3 py-1 text-nowrap transition-colors hover:bg-zinc-700 hover:text-white disabled:pointer-events-none disabled:opacity-50 dark:bg-zinc-700 dark:hover:bg-zinc-200 dark:hover:text-zinc-950"
                      type="button"
                    >
                      <span className="flex items-center justify-center gap-1">
                        <ArrowDownTrayIcon className="size-5 shrink-0" />
                        {i("buttons.import")}
                      </span>
                    </button>
                  </div>
                </li>
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="sr-only"
        onChange={handleFileChange}
      />
    </div>
  );
}
