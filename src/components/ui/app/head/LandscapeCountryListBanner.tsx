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

import { countries } from "@/data/countries";
import { pastElections } from "@/data/pastElections";
import { allCountries } from "@/data/allCountries";
import {
  useI18n,
  useSelectedCountry,
  useParties,
  useSelectedParties,
  useCustomInfo,
} from "@/lib/zustandStore";
import { Country } from "@/types";
import CollapsibleSection from "./CollapsibleSection";

export default function LandscapeCountryListBanner() {
  const { i } = useI18n();
  const { selectedCountry, setSelectedCountry } = useSelectedCountry();
  const { setParties } = useParties();
  const { setSelectedParties } = useSelectedParties();
  const { customInfo, setCustomInfo } = useCustomInfo();

  function select(country: Country) {
    setSelectedCountry(country);
    const findCountry = allCountries.find((c) => c.name === country.name);
    if (findCountry) {
      setParties(findCountry.parties);
      setSelectedParties(findCountry.parties);
    } else {
      setSelectedCountry(null);
      setParties([]);
      setSelectedParties([]);
    }
  }

  function renderCountry(country: Country, dateLabelKey: string) {
    return (
      <li key={country.name} value={country.name} id={country.name}>
        <button
          onClick={() => select(country)}
          className={`flex w-full flex-col items-start p-2 text-start transition-colors duration-300 ${
            selectedCountry === country
              ? "bg-zinc-200 dark:bg-zinc-700"
              : "hover:bg-zinc-200 dark:hover:bg-zinc-700"
          }`}
        >
          <div className="line-clamp-1 flex gap-1">
            <span>{country.name}</span>
            <span>{country.emoji}</span>
          </div>
          <p className="text-xs opacity-75">
            {i(dateLabelKey)}:{" "}
            {new Date(country.updateDate).toLocaleDateString(i("locale"), {
              timeZone: "UTC",
            })}
          </p>
        </button>
      </li>
    );
  }

  return (
    <>
      <div className="sticky top-4 z-100 h-[80vh] w-full overflow-auto rounded-2xl border-2 border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="p-2 text-xl font-semibold">{i("header.countries")}</h2>
        <ul>
          <CollapsibleSection title={i("header.custom")}>
            <li>
              <button
                onClick={() => {
                  if (selectedCountry) {
                    setSelectedCountry(null);
                    setParties([]);
                    setSelectedParties([]);
                    setCustomInfo({ name: "", updateDate: "" });
                  }
                }}
                className={`flex w-full flex-col items-start p-2 text-start transition-colors duration-300 ${
                  !selectedCountry
                    ? "bg-zinc-200 dark:bg-zinc-700"
                    : "hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                <div className="line-clamp-1 flex gap-1">
                  <span>
                    {(!selectedCountry && customInfo.name) ||
                      i("header.custom")}
                  </span>
                </div>
                {!selectedCountry && customInfo.updateDate && (
                  <p className="text-xs opacity-75">
                    {i("body.dataUpdatedAt")}:{" "}
                    {new Date(customInfo.updateDate).toLocaleDateString(
                      i("locale"),
                      { timeZone: "UTC" },
                    )}
                  </p>
                )}
              </button>
            </li>
          </CollapsibleSection>
          <CollapsibleSection title={i("header.sampleCountries")}>
            {[...countries]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((country) =>
                renderCountry(country, "body.sampleDataUpdatedAt"),
              )}
          </CollapsibleSection>
          <CollapsibleSection title={i("header.pastElections")}>
            {[...pastElections]
              .sort((a, b) => b.updateDate.localeCompare(a.updateDate))
              .map((country) => renderCountry(country, "body.electionDate"))}
          </CollapsibleSection>
        </ul>
      </div>
    </>
  );
}
