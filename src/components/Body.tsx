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

import { sort } from "@/utils/sort";
import {
  useSelectedParties,
  useIsEditMode,
  useParties,
  useSortBy,
  useI18n,
  useSelectedPreset,
  useMajorityThreshold,
  useCustomInfo,
  usePartyInfo,
} from "@/lib/zustandStore";
import { getPartyInfo, getPartyKey } from "@/data/partyInfo";
import {
  PartyButton,
  MajorityThresholdButton,
  SwitchViewModeButton,
  SortButton,
  CoalitionBySpectrumButtons,
  AddNewPartyButton,
  SeatsGraph,
  PresetListDropdown,
  PresetInfoEditor,
  PresetDescription,
  SeatAllocationEditor,
  PartyInfoDialog,
  JsonShareExportButton,
  JsonShareImportButton,
  PieChart,
} from "@/components/ui/app";
import { TrashIcon } from "@heroicons/react/20/solid";

const Seats = () => {
  const { parties, setParties } = useParties();
  const { selectedParties, setSelectedParties } = useSelectedParties();
  const { isEditMode } = useIsEditMode();
  const { sortBy } = useSortBy();
  const { i } = useI18n();
  const { setSelectedPreset } = useSelectedPreset();
  const { majorityThreshold } = useMajorityThreshold();
  const { setCustomInfo } = useCustomInfo();
  const { setPartyKey } = usePartyInfo();

  return (
    <div>
      <div className="mt-4 block lg:hidden">
        <PresetListDropdown />
      </div>
      <PresetDescription />
      <PartyInfoDialog />
      <div className="relative z-12 mt-4 -mb-[calc(env(safe-area-inset-top))] aspect-2/1 h-full w-full">
        <PieChart
          parties={parties}
          selectedParties={[...selectedParties]}
          isEditMode={isEditMode}
          sortBy={sortBy}
          majorityThreshold={majorityThreshold}
          onPartyClick={(party) => {
            const key = getPartyKey(party.id);
            if (getPartyInfo(key)) setPartyKey(key);
          }}
        />
      </div>
      <div className="sticky top-0 z-10 mx-auto w-full">
        <SeatsGraph />
      </div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <MajorityThresholdButton />
        <SortButton />
        <SwitchViewModeButton />
      </div>
      {isEditMode && (
        <>
          <PresetInfoEditor />
          <SeatAllocationEditor />
        </>
      )}
      <>
        <ul
          className={`xs:grid-cols-2 grid grid-cols-1 gap-4 transition-all sm:grid-cols-3 sm:gap-4 xl:grid-cols-4`}
        >
          {[...parties]
            .sort((a, b) => sort(a, b, isEditMode, sortBy))
            .map((party) => (
              <li key={party.id}>
                <PartyButton party={party} />
              </li>
            ))}
          {isEditMode && (
            <li className="flex h-full w-full items-center justify-center">
              <AddNewPartyButton />
            </li>
          )}
        </ul>
      </>
      {parties.length <= 0 && !isEditMode && (
        <p className="text-center">{i("body.noParties")}</p>
      )}

      {/* <p className="flex-1 text-sm opacity-75 ">
          Simulation Controls
        </p> */}

      <CoalitionBySpectrumButtons />

      {/* <p className="flex-1 text-sm opacity-75 mt-2">
          Data Management
        </p> */}
      <span className="mt-4 flex w-full items-center justify-start gap-2 text-sm font-semibold text-nowrap text-zinc-900 opacity-75 dark:text-white">
        {i("buttons.dataManagement")}
      </span>
      <div className="mt-1 flex flex-wrap gap-2 rounded-2xl bg-zinc-200 p-4 dark:bg-zinc-700">
        <div className="flex w-full flex-row flex-wrap gap-2">
          <JsonShareImportButton />
          <JsonShareExportButton />
        </div>
        <button
          onClick={() => {
            const shouldClear = window.confirm(i("dialogs.clearDataConfirm"));

            if (!shouldClear) return;

            setParties([]);
            setSelectedParties([]);
            setSelectedPreset(null);
            setCustomInfo({ name: "", updateDate: "" });
          }}
          className="w-full flex-1 rounded-full border-2 border-transparent bg-white py-1 text-rose-600 transition-colors duration-300 hover:bg-rose-600 hover:text-white dark:bg-zinc-900 dark:text-rose-500"
        >
          <span className="line-clamp-1 flex items-center justify-center gap-1 text-nowrap">
            <TrashIcon className="size-5 shrink-0" />
            {i("buttons.clear")}
          </span>
        </button>
      </div>
    </div>
  );
};

export default Seats;
