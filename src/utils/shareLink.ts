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

import { CountryData } from "@/types";
import { parseCountry, stringifyCountry } from "@/utils/parseCountry";

// The data lives in the URL hash, so it is never sent to the server
const shareDataKey = "data";

async function deflate(text: string) {
  const stream = new Blob([text])
    .stream()
    .pipeThrough(new CompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function inflate(bytes: Uint8Array<ArrayBuffer>) {
  const stream = new Blob([bytes])
    .stream()
    .pipeThrough(new DecompressionStream("deflate-raw"));
  return new Response(stream).text();
}

function toBase64Url(bytes: Uint8Array) {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join(
    "",
  );
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(text: string) {
  const binary = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export async function encodeShareData(country: CountryData) {
  return toBase64Url(await deflate(stringifyCountry(country, 0)));
}

// Returns null when the data is damaged or is not a country
export async function decodeShareData(data: string) {
  try {
    return parseCountry(await inflate(fromBase64Url(data)));
  } catch {
    return null;
  }
}

export async function createShareLink(country: CountryData, baseUrl: string) {
  const url = new URL(baseUrl);
  url.search = "";
  url.hash = new URLSearchParams({
    [shareDataKey]: await encodeShareData(country),
  }).toString();
  return url.toString();
}

export function getShareData(hash: string) {
  return new URLSearchParams(hash.replace(/^#/, "")).get(shareDataKey);
}

// Sent by an embed so the embed code can fit the iframe to it
export const embedHeightMessage = "parliament-seats:height";

export async function createEmbedLink(country: CountryData, baseUrl: string) {
  const url = new URL(await createShareLink(country, baseUrl));
  url.search = "embed";
  return url.toString();
}

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

export function createEmbedCode(embedLink: string, country: CountryData) {
  const { origin } = new URL(embedLink);
  const title = country.name
    ? `${country.name} - Parliament Seats`
    : "Parliament Seats";
  // A rough fit for a few rows of parties, until the script resizes it
  const height = 560 + Math.ceil(country.parties.length / 3) * 60;
  const iframe = `<iframe src="${escapeHtml(embedLink)}" title="${escapeHtml(title)}" width="100%" height="${height}" style="border:0;max-width:100%" loading="lazy"></iframe>`;
  // Sites that strip scripts still show the iframe at the fixed height
  const script = `<script>window.addEventListener("message",function(e){if(e.origin!==${JSON.stringify(origin)}||!e.data||e.data.type!==${JSON.stringify(embedHeightMessage)}||typeof e.data.height!=="number")return;document.querySelectorAll("iframe").forEach(function(f){if(f.contentWindow===e.source)f.style.height=e.data.height+"px"})})</script>`;
  return `${iframe}\n${script}`;
}
