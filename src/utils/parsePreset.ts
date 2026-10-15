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

import { supportedLocales } from "@/i18n/i18n";
import { PresetData, MajorityThreshold, Party, SortByState } from "@/types";

const sortByKeys: SortByState["sortBy"][] = ["name", "position", "seats"];

function isParties(data: unknown): data is Party[] {
  return (
    Array.isArray(data) &&
    data.every(
      (item): item is Party =>
        typeof item === "object" &&
        item !== null &&
        typeof item.name === "string" &&
        typeof item.shortName === "string" &&
        typeof item.seats === "number" &&
        typeof item.colour === "string" &&
        typeof item.position === "number" &&
        (typeof item.isIndependent === "boolean" ||
          item.isIndependent === undefined) &&
        (typeof item.votes === "number" || item.votes === undefined) &&
        (typeof item.isThresholdExempt === "boolean" ||
          item.isThresholdExempt === undefined) &&
        (typeof item.isSupport === "boolean" || item.isSupport === undefined),
    )
  );
}

function isMajorityThreshold(data: unknown): data is MajorityThreshold {
  if (typeof data !== "object" || data === null) return false;

  const { numerator, denominator } = data as Record<string, unknown>;

  return (
    typeof numerator === "number" &&
    typeof denominator === "number" &&
    Number.isInteger(numerator) &&
    Number.isInteger(denominator) &&
    numerator > 0 &&
    numerator <= denominator &&
    // Custom thresholds are stored out of 10000, and larger fractions could lose precision
    denominator <= 10000
  );
}

function isSortBy(data: unknown): data is SortByState["sortBy"] {
  return sortByKeys.some((key) => key === data);
}

function isLocale(data: unknown): data is string {
  return supportedLocales.some((locale) => locale === data);
}

export function stringifyPreset(
  {
    name,
    updateDate,
    parties,
    selectedParties,
    majorityThreshold,
    allowTieBreaker,
    sortBy,
    locale,
  }: PresetData,
  space = 2,
) {
  const isEveryPartySelected = parties.every(({ id }) =>
    selectedParties.some((party) => party.id === id),
  );
  // Leaving the ids out selects every party on import
  const selectedPartyIds = isEveryPartySelected
    ? undefined
    : selectedParties.map(({ id }) => id);
  return JSON.stringify(
    {
      name,
      updateDate,
      locale,
      majorityThreshold,
      allowTieBreaker,
      sortBy,
      parties,
      selectedPartyIds,
    },
    null,
    space,
  );
}

// Throws when the data is not JSON, and returns null when it is not a preset or a list of parties
export function parsePreset(data: string): PresetData | null {
  const parsedData: unknown = JSON.parse(data);

  // Older exports are only a list of parties
  if (isParties(parsedData)) {
    return {
      name: "",
      updateDate: "",
      parties: parsedData,
      selectedParties: parsedData,
    };
  }

  if (typeof parsedData !== "object" || parsedData === null) return null;

  const {
    name = "",
    updateDate = "",
    parties,
    selectedPartyIds,
    majorityThreshold,
    allowTieBreaker,
    sortBy,
    locale,
  } = parsedData as Record<string, unknown>;

  const isValid =
    typeof name === "string" &&
    typeof updateDate === "string" &&
    (updateDate === "" || /^\d{4}-\d{2}-\d{2}$/.test(updateDate)) &&
    isParties(parties) &&
    (selectedPartyIds === undefined ||
      (Array.isArray(selectedPartyIds) &&
        selectedPartyIds.every(
          (id): id is string => typeof id === "string",
        ))) &&
    (majorityThreshold === undefined ||
      isMajorityThreshold(majorityThreshold)) &&
    (allowTieBreaker === undefined || typeof allowTieBreaker === "boolean") &&
    (sortBy === undefined || isSortBy(sortBy)) &&
    (locale === undefined || isLocale(locale));

  if (!isValid) return null;

  return {
    name,
    updateDate,
    parties,
    // Every party is selected when the data does not say otherwise
    selectedParties: selectedPartyIds
      ? parties.filter(({ id }) => selectedPartyIds.includes(id))
      : parties,
    majorityThreshold,
    allowTieBreaker,
    sortBy,
    locale,
  };
}
