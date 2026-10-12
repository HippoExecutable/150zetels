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
import { Logo } from "./icons/Logo";

export default function Header() {
  const { i } = useI18n();
  return (
    <>
      <header className={"flex flex-wrap items-center justify-between gap-4"}>
        <a href="/">
          <div className={"flex items-center gap-2"}>
            <Logo className="size-12 shrink-0" />
            <div className="flex flex-col justify-start">
              <h1 className="text-2xl font-bold">150zetels.nl</h1>
              <p className="text-sm leading-4 opacity-75">{i("subtitle")}</p>
            </div>
          </div>
        </a>
      </header>
    </>
  );
}
