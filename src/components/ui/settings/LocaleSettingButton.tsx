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

import { locales } from "@/i18n/i18n";
import { useI18n } from "@/lib/zustandStore";
import { ChevronDownIcon, LanguageIcon } from "@heroicons/react/20/solid";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

export default function LocaleSettingButton() {
  const { locale, setLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      dropdownRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div
      className="relative z-100"
      tabIndex={-1}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsOpen(false);
        }
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`rounded-full border-2 border-transparent px-3 py-1 text-nowrap transition-colors hover:bg-zinc-700 hover:text-white dark:hover:bg-zinc-200 dark:hover:text-zinc-950 ${
          isOpen
            ? "bg-zinc-700 text-white dark:bg-zinc-200 dark:text-zinc-950"
            : "bg-white dark:bg-zinc-900"
        }`}
        type="button"
        aria-expanded={isOpen}
      >
        <span className="line-clamp-1 flex items-center justify-center gap-1 text-nowrap">
          <LanguageIcon className="size-5 shrink-0" />
          {locale.toUpperCase()}
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
                {Object.keys(locales).map((loc) => (
                  <li
                    key={loc}
                    className={`transition-colors duration-300 ${
                      locale === loc
                        ? "bg-zinc-200 dark:bg-zinc-700"
                        : "hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    <button
                      onClick={() => {
                        setLocale(loc);
                        setIsOpen(false);
                      }}
                      className="flex w-full items-center gap-2 p-2 text-start"
                      type="button"
                    >
                      {loc.toUpperCase()}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
