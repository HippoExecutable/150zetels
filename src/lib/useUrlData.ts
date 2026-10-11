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
import { allPresets } from "@/data/allPresets";
import { supportedLocales } from "@/i18n/i18n";
import {
  useParties,
  useSelectedParties,
  useSelectedPreset,
  useI18n,
  importPresetData,
} from "@/lib/zustandStore";
import { PresetData } from "@/types";
import { decodeShareData, getShareData } from "@/utils/shareLink";

// Loads the preset, shared data, and language that the URL asks for,
// and returns the shared data and whether a share link could not be read
export function useUrlData(isEmbed: boolean) {
  const { setParties } = useParties();
  const { setSelectedParties } = useSelectedParties();
  const { setSelectedPreset } = useSelectedPreset();
  const { i, setLocale } = useI18n();
  const [sharedPreset, setSharedPreset] = useState<PresetData | null>(null);
  const [isShareLinkInvalid, setIsShareLinkInvalid] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(document.location.search);
    const presetName = queryParams.get("preset");
    const lang = queryParams.get("lang");
    let isCancelled = false;

    const loadPreset = () => {
      const preset =
        allPresets.find((preset) => preset.name === presetName) ??
        allPresets.find((preset) => preset.name === "European Union");
      if (preset) {
        setSelectedPreset(preset);
        setParties(preset.parties);
        setSelectedParties(preset.parties);
      }
    };

    const loadSharedPreset = async (data: string) => {
      const decodedPreset = await decodeShareData(data);
      if (isCancelled) return;

      setSharedPreset(decodedPreset);
      setIsShareLinkInvalid(!decodedPreset);
      if (decodedPreset) {
        importPresetData(decodedPreset);
      } else if (!isEmbed) {
        // Embeds show a message instead, since iframes block alerts
        alert(i("dialogs.invalidShareLink"));
        loadPreset();
      }
    };

    // Pasting a share link into an open tab only changes the hash
    const handleHashChange = () => {
      const data = getShareData(document.location.hash);
      if (data) loadSharedPreset(data);
    };

    const data = getShareData(document.location.hash);
    if (data) {
      loadSharedPreset(data);
    } else {
      loadPreset();
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
    setSelectedPreset,
    setSelectedParties,
  ]);

  return { sharedPreset, isShareLinkInvalid };
}
