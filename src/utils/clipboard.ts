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

// Safari only lets a click write to the clipboard straight away, so content
// that takes a moment to make is handed over as a promise instead
async function copyBlob(type: string, blob: Promise<Blob>) {
  await navigator.clipboard.write([new ClipboardItem({ [type]: blob })]);
}

const hasClipboardItem = typeof ClipboardItem !== "undefined";

export const canCopyImage = hasClipboardItem;

export async function copyText(text: Promise<string>) {
  if (!hasClipboardItem) {
    await navigator.clipboard.writeText(await text);
    return;
  }

  await copyBlob(
    "text/plain",
    text.then((value) => new Blob([value], { type: "text/plain" })),
  );
}

export async function copyImage(image: Promise<Blob>) {
  await copyBlob("image/png", image);
}
