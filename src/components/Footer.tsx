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

import { useI18n } from "@/lib/zustandStore";
import { LocaleSettingButton, ThemeButton } from "@/components/ui/settings/";

export default function Footer() {
  const { i } = useI18n();
  return (
    <>
      <footer className={"mt-4 rounded-2xl bg-zinc-200 p-4 dark:bg-zinc-700"}>
        <div
          className={
            "flex w-full flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
          }
        >
          <div className={"flex-1 text-start"}>
            <p>
              &copy; {new Date().getFullYear()}{" "}
              <a
                className={"no-underline hover:underline"}
                href={"https://150zetels.nl/"}
                rel={"noreferrer noopener"}
                target={"_blank"}
              >
                150zetels.nl
              </a>{" "}
            </p>
            <p className={"text-sm opacity-75"}>
              {i("footer.originalText")}{" "}
              <a
                className={"underline hover:no-underline"}
                href={"https://parl.hsw.is/"}
                rel={"noreferrer noopener"}
                target={"_blank"}
              >
                {i("footer.clickHere")}
              </a>{" | "}
              {i("footer.restText")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ThemeButton />
            <div className="flex gap-2">
              <LocaleSettingButton />
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
