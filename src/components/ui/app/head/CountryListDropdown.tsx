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
import { countries } from "@/data/countries";
import { useEffect, useRef, useState } from "react";
import { Country } from "@/types";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

export default function CountryListDropdown() {
  const { selectedCountry, setSelectedCountry } = useSelectedCountry();
  const { setParties } = useParties();
  const { setSelectedParties } = useSelectedParties();
  const { customInfo, setCustomInfo } = useCustomInfo();
  const { i } = useI18n();
  const [openCountryList, setOpenCountryList] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});

  useEffect(() => {
    if (openCountryList && dropdownRef.current) {
      dropdownRef.current.focus();
    }
  }, [openCountryList]);

  function select(country: Country) {
    setSelectedCountry(country);
    const findCountry = countries.find((c) => c.name === country.name);
    if (findCountry) {
      setParties(findCountry.parties);
      setSelectedParties(findCountry.parties);
    } else {
      setSelectedCountry(null);
      setParties([]);
      setSelectedParties([]);
    }
    setOpenCountryList(false);
  }

  useEffect(() => {
    if (
      openCountryList &&
      selectedCountry &&
      itemRefs.current[selectedCountry.name]
    ) {
      const itemRef = itemRefs.current[selectedCountry.name];
      if (itemRef) {
        itemRef.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [openCountryList, selectedCountry]);

  return (
    <div
      tabIndex={0}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setOpenCountryList(false);
        }
      }}
    >
      <button
        onClick={() => {
          setOpenCountryList(!openCountryList);
        }}
        className={`w-full rounded-2xl border-2 border-zinc-200 p-2 pe-1 transition-colors duration-300 dark:border-zinc-700 ${
          openCountryList
            ? "bg-zinc-200 dark:bg-zinc-700"
            : "bg-white dark:bg-zinc-900"
        }`}
      >
        <div className="flex items-center justify-between gap-1">
          {selectedCountry ? (
            <div className="flex flex-col items-start gap-0 text-start">
              <div className="flex gap-1">
                <span>{selectedCountry.name}</span>
                <span>{selectedCountry.emoji}</span>
              </div>
              <p className="text-xs opacity-75">
                {i("body.sampleDataUpdatedAt")}:{" "}
                {new Date(selectedCountry.updateDate).toLocaleDateString(
                  i("locale"),
                  { timeZone: "UTC" },
                )}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-start gap-0 text-start">
              <span>{customInfo.name || i("header.custom")}</span>
              {customInfo.updateDate && (
                <p className="text-xs opacity-75">
                  {i("body.dataUpdatedAt")}:{" "}
                  {new Date(customInfo.updateDate).toLocaleDateString(
                    i("locale"),
                    { timeZone: "UTC" },
                  )}
                </p>
              )}
            </div>
          )}
          <ChevronDownIcon
            className={`size-5 transition-transform duration-300 ${openCountryList ? "rotate-180" : ""}`}
          />
        </div>
      </button>
      <div className="relative">
        <AnimatePresence>
          {openCountryList && (
            <>
              <motion.div
                key="modal"
                transition={{
                  duration: 0.3,
                }}
                initial={{ opacity: 0, translateY: -8 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: -2 }}
                className="absolute top-0 z-75 max-h-[50vh] w-full overflow-auto rounded-2xl border-2 border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
                ref={dropdownRef}
              >
                <ul>
                  <li>
                    <span className="px-2 py-1 text-sm opacity-75">
                      {i("header.custom")}
                    </span>
                    <ul>
                      <li>
                        <button
                          onClick={() => {
                            if (selectedCountry) {
                              setSelectedCountry(null);
                              setParties([]);
                              setSelectedParties([]);
                              setCustomInfo({ name: "", updateDate: "" });
                            }
                            setOpenCountryList(false);
                          }}
                          className={`flex w-full flex-col items-start p-2 text-start transition-colors duration-300 ${
                            !selectedCountry
                              ? "bg-zinc-200 dark:bg-zinc-700"
                              : "hover:bg-zinc-200 dark:hover:bg-zinc-700"
                          }`}
                        >
                          <div className="flex gap-1">
                            <span>
                              {(!selectedCountry && customInfo.name) ||
                                i("header.custom")}
                            </span>
                          </div>
                          {!selectedCountry && customInfo.updateDate && (
                            <p className="text-xs opacity-75">
                              {i("body.dataUpdatedAt")}:{" "}
                              {new Date(
                                customInfo.updateDate,
                              ).toLocaleDateString(i("locale"), {
                                timeZone: "UTC",
                              })}
                            </p>
                          )}
                        </button>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <span className="px-2 py-1 text-sm opacity-75">
                      {i("header.sampleCountries")}
                    </span>
                    <ul>
                      {[...countries]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((country) => (
                          <li
                            key={country.name}
                            value={country.name}
                            id={country.name}
                            ref={(el) => {
                              if (el) itemRefs.current[country.name] = el;
                            }}
                          >
                            <button
                              onClick={() => {
                                select(country);
                              }}
                              className={`flex w-full flex-col items-start p-2 text-start transition-colors duration-300 ${
                                selectedCountry === country
                                  ? "bg-zinc-200 dark:bg-zinc-700"
                                  : "hover:bg-zinc-200 dark:hover:bg-zinc-700"
                              }`}
                            >
                              <div className="flex gap-1">
                                <span>{country.name}</span>
                                <span>{country.emoji}</span>
                              </div>
                              {/* {selectedCountry === country && ( */}
                              <p className="text-xs opacity-75">
                                {i("body.sampleDataUpdatedAt")}:{" "}
                                {new Date(
                                  country.updateDate,
                                ).toLocaleDateString(i("locale"), {
                                  timeZone: "UTC",
                                })}
                              </p>
                              {/* )} */}
                            </button>
                          </li>
                        ))}
                    </ul>
                  </li>
                </ul>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
