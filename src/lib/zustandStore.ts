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
import { defaultLocale, translate, supportedLocales } from "@/i18n/i18n";
import {
  DefaultCountryValueState,
  PartiesState,
  IsEditModeState,
  SortByState,
  AllowTieBreakerState,
  MajorityThresholdState,
  SelectedPartiesState,
  SelectedCountryState,
  I18nState,
  CustomInfoState,
  CountryData,
  IncludeOptions,
} from "@/types";
import { simpleMajority } from "@/utils/getMajority";
import { create } from "zustand";

function getBrowserLocale() {
  if (typeof navigator === "undefined") return null;

  const candidates = [navigator.language, ...navigator.languages].filter(
    (value): value is string => typeof value === "string" && value.length > 0,
  );

  for (const candidate of candidates) {
    const normalized = candidate.toLowerCase();
    const exactMatch = supportedLocales.find((locale) => locale === normalized);

    if (exactMatch) return exactMatch;

    const baseLocale = normalized.split("-")[0];
    const baseMatch = supportedLocales.find((locale) => locale === baseLocale);

    if (baseMatch) return baseMatch;
  }

  return null;
}

const useDefaultCountryValue = create<DefaultCountryValueState>((set) => ({
  defaultCountryValue: null,
  setDefaultCountryValue: (by) => set(() => ({ defaultCountryValue: by })),
}));

const useParties = create<PartiesState>((set) => ({
  parties: [],
  setParties: (by) => set(() => ({ parties: by })),
}));

const useSelectedParties = create<SelectedPartiesState>((set) => ({
  selectedParties: [],
  setSelectedParties: (by) => set(() => ({ selectedParties: by })),
}));

const useIsEditMode = create<IsEditModeState>((set) => ({
  isEditMode: false,
  setIsEditMode: (by) => set(() => ({ isEditMode: by })),
}));

const useSortBy = create<SortByState>((set) => ({
  sortBy: "seats",
  setSortBy: (by) => set(() => ({ sortBy: by })),
}));

const useAllowTieBreaker = create<AllowTieBreakerState>((set) => ({
  allowTieBreaker: false,
  setAllowTieBreaker: (by) => set(() => ({ allowTieBreaker: by })),
}));

const useMajorityThreshold = create<MajorityThresholdState>((set) => ({
  majorityThreshold: simpleMajority,
  setMajorityThreshold: (by) => set(() => ({ majorityThreshold: by })),
}));

const useI18n = create<I18nState>((set, get) => ({
  locale:
    typeof window !== "undefined"
      ? (localStorage.getItem("locale") ?? getBrowserLocale() ?? defaultLocale)
      : defaultLocale,
  i: (key) => {
    const currentLocale = get().locale;
    return translate({ locale: currentLocale, id: key });
  },
  setLocale: (by) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("locale", by);
    }
    set(() => ({ locale: by }));
  },
}));

const useSelectedCountry = create<SelectedCountryState>((set) => ({
  selectedCountry: countries.find((c) => c.name === "European Union") ?? null,
  setSelectedCountry: (by) => {
    set(() => ({ selectedCountry: by }));
  },
}));

const useCustomInfo = create<CustomInfoState>((set) => ({
  customInfo: { name: "", updateDate: "" },
  setCustomInfo: (by) => set(() => ({ customInfo: by })),
}));

// Loads imported or shared data, and keeps the settings it leaves out
function importCountryData({
  name,
  updateDate,
  parties,
  selectedParties,
  majorityThreshold,
  allowTieBreaker,
  sortBy,
  locale,
}: CountryData) {
  useParties.getState().setParties(parties);
  useSelectedParties.getState().setSelectedParties(selectedParties);
  useSelectedCountry.getState().setSelectedCountry(null);
  useCustomInfo.getState().setCustomInfo({ name, updateDate });

  if (majorityThreshold) {
    useMajorityThreshold.getState().setMajorityThreshold(majorityThreshold);
  }
  if (allowTieBreaker !== undefined) {
    useAllowTieBreaker.getState().setAllowTieBreaker(allowTieBreaker);
  }
  if (sortBy) useSortBy.getState().setSortBy(sortBy);
  if (locale) useI18n.getState().setLocale(locale);
}

// Collects the current data, and leaves out the settings that are not included
function exportCountryData(include: IncludeOptions): CountryData {
  const { parties } = useParties.getState();
  const { selectedParties } = useSelectedParties.getState();
  const { selectedCountry } = useSelectedCountry.getState();
  const { customInfo } = useCustomInfo.getState();
  const { majorityThreshold } = useMajorityThreshold.getState();
  const { allowTieBreaker } = useAllowTieBreaker.getState();
  const { sortBy } = useSortBy.getState();
  const { locale } = useI18n.getState();
  const { name, updateDate } = selectedCountry ?? customInfo;

  return {
    name,
    updateDate,
    parties,
    selectedParties: include.selectedParties ? selectedParties : parties,
    majorityThreshold: include.majorityThreshold
      ? majorityThreshold
      : undefined,
    allowTieBreaker: include.majorityThreshold ? allowTieBreaker : undefined,
    sortBy: include.sortBy ? sortBy : undefined,
    locale: include.locale ? locale : undefined,
  };
}

export {
  useDefaultCountryValue,
  useParties,
  useSelectedParties,
  useIsEditMode,
  useSortBy,
  useAllowTieBreaker,
  useMajorityThreshold,
  useI18n,
  useSelectedCountry,
  useCustomInfo,
  importCountryData,
  exportCountryData,
};
