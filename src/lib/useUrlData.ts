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

import { useEffect, useState } from "react";
import { allCountries } from "@/data/allCountries";
import { supportedLocales } from "@/i18n/i18n";
import {
  useParties,
  useSelectedParties,
  useSelectedCountry,
  useI18n,
  importCountryData,
} from "@/lib/zustandStore";
import { CountryData } from "@/types";
import { decodeShareData, getShareData } from "@/utils/shareLink";

// Loads the sample country, shared data, and language that the URL asks for,
// and returns the shared data and whether a share link could not be read
export function useUrlData(isEmbed: boolean) {
  const { setParties } = useParties();
  const { setSelectedParties } = useSelectedParties();
  const { setSelectedCountry } = useSelectedCountry();
  const { i, setLocale } = useI18n();
  const [sharedCountry, setSharedCountry] = useState<CountryData | null>(null);
  const [isShareLinkInvalid, setIsShareLinkInvalid] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(document.location.search);
    const countryName = queryParams.get("country");
    const lang = queryParams.get("lang");
    let isCancelled = false;

    const loadCountry = () => {
      const country =
        allCountries.find((country) => country.name === countryName) ??
        allCountries.find((country) => country.name === "European Union");
      if (country) {
        setSelectedCountry(country);
        setParties(country.parties);
        setSelectedParties(country.parties);
      }
    };

    const loadSharedCountry = async (data: string) => {
      const decodedCountry = await decodeShareData(data);
      if (isCancelled) return;

      setSharedCountry(decodedCountry);
      setIsShareLinkInvalid(!decodedCountry);
      if (decodedCountry) {
        importCountryData(decodedCountry);
      } else if (!isEmbed) {
        // Embeds show a message instead, since iframes block alerts
        alert(i("dialogs.invalidShareLink"));
        loadCountry();
      }
    };

    // Pasting a share link into an open tab only changes the hash
    const handleHashChange = () => {
      const data = getShareData(document.location.hash);
      if (data) loadSharedCountry(data);
    };

    const data = getShareData(document.location.hash);
    if (data) {
      loadSharedCountry(data);
    } else {
      loadCountry();
    }

    if (lang && supportedLocales.some((locale) => locale === lang)) {
      setLocale(lang);
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      isCancelled = true;
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [
    i,
    isEmbed,
    setLocale,
    setParties,
    setSelectedCountry,
    setSelectedParties,
  ]);

  return { sharedCountry, isShareLinkInvalid };
}
