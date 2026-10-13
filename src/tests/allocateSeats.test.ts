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

import { expect, test } from "vitest";
import {
  allocateSeats,
  applyThreshold,
  getDefaultTotalVotes,
} from "@/utils/allocateSeats";

// Worked examples from the Wikipedia articles on each method
const fourParties = [100000, 80000, 30000, 20000];
const sixParties = [47000, 16000, 15800, 12000, 6100, 3100];

test("allocates seats with D'Hondt", () => {
  expect(allocateSeats(fourParties, 8, "dHondt")).toEqual([4, 3, 1, 0]);
  expect(allocateSeats(sixParties, 10, "dHondt")).toEqual([5, 2, 2, 1, 0, 0]);
});

test("allocates seats with Sainte-Laguë", () => {
  expect(allocateSeats(fourParties, 8, "sainteLague")).toEqual([3, 3, 1, 1]);
  expect(allocateSeats(sixParties, 10, "sainteLague")).toEqual([
    4, 2, 2, 1, 1, 0,
  ]);
});

test("allocates seats with the largest remainder", () => {
  expect(allocateSeats(fourParties, 8, "largestRemainder")).toEqual([
    3, 3, 1, 1,
  ]);
  expect(allocateSeats(sixParties, 10, "largestRemainder")).toEqual([
    5, 2, 1, 1, 1, 0,
  ]);
});

test("gives the seats of parties below the threshold to the others", () => {
  // The smallest party has 8.7% of the votes
  expect(allocateSeats(fourParties, 8, "sainteLague", { percent: 10 })).toEqual(
    [4, 3, 1, 0],
  );
  expect(
    allocateSeats(fourParties, 8, "largestRemainder", { percent: 10 }),
  ).toEqual([4, 3, 1, 0]);
});

test("lets parties exactly at the threshold pass", () => {
  expect(
    allocateSeats([5, 95], 20, "largestRemainder", { percent: 5 }),
  ).toEqual([1, 19]);
  expect(
    allocateSeats([5, 95], 20, "largestRemainder", { percent: 5.01 }),
  ).toEqual([0, 20]);
});

test("works with vote shares that do not add up to 100", () => {
  const seats = allocateSeats([47.5, 30, 18, 4.5], 150, "dHondt", {
    percent: 5,
  });

  expect(seats[3]).toBe(0);
  expect(seats.reduce((acc, count) => acc + count, 0)).toBe(150);
});

test("breaks ties by votes, then by the order listed", () => {
  // The second seat is a tie between 20 / 2 and 10 / 1
  expect(allocateSeats([20, 10], 2, "dHondt")).toEqual([2, 0]);
  expect(allocateSeats([10, 20], 2, "dHondt")).toEqual([0, 2]);
  expect(allocateSeats([10, 10], 1, "dHondt")).toEqual([1, 0]);
  expect(allocateSeats([10, 10], 1, "largestRemainder")).toEqual([1, 0]);
});

test("gives no seats without votes or seats to fill", () => {
  expect(allocateSeats([0, 0], 10, "dHondt")).toEqual([0, 0]);
  expect(allocateSeats([], 10, "sainteLague")).toEqual([]);
  expect(allocateSeats([10, 20], 0, "largestRemainder")).toEqual([0, 0]);
  expect(allocateSeats([50, 50], 10, "dHondt", { percent: 60 })).toEqual([
    0, 0,
  ]);
});

test("ignores negative votes", () => {
  expect(allocateSeats([-10, 30, 10], 4, "dHondt")).toEqual([0, 3, 1]);
  expect(applyThreshold([-1000, 3000, 1000], { percent: 25 })).toEqual([
    0, 3000, 1000,
  ]);
});

// Germany 2025, without FDP and the other parties that won no seats
const bundestagShares = [28.52, 20.8, 16.41, 11.61, 8.77, 4.98];

test("measures vote shares against 100, not the shares entered", () => {
  expect(getDefaultTotalVotes(bundestagShares)).toBe(100);
  expect(applyThreshold(bundestagShares, { percent: 5 })).toEqual([
    28.52, 20.8, 16.41, 11.61, 8.77, 0,
  ]);
  expect(
    allocateSeats(bundestagShares, 630, "sainteLague", { percent: 5 })[5],
  ).toBe(0);
});

test("measures vote counts against the total votes given", () => {
  const counts = [14156000, 10328000, 8149000, 5762000, 4356000, 2472000];

  expect(getDefaultTotalVotes(counts)).toBe(45223000);
  // 2472000 is 5.5% of the votes entered, but 4.98% of all valid votes
  expect(applyThreshold(counts, { percent: 5 })[5]).toBe(2472000);
  expect(applyThreshold(counts, { percent: 5, totalVotes: 49649000 })[5]).toBe(
    0,
  );
});

test("never measures against fewer votes than were entered", () => {
  expect(applyThreshold([60, 40], { percent: 45, totalVotes: 50 })).toEqual([
    60, 0,
  ]);
});

test("gives seats to exempt parties below the threshold", () => {
  // Germany 2025 with the SSW, which is exempt as a national minority party
  const shares = [28.52, 20.8, 16.41, 11.61, 8.77, 4.98, 0.15];
  const isExempt = [false, false, false, false, false, false, true];

  expect(
    allocateSeats(shares, 630, "sainteLague", { percent: 5, isExempt }),
  ).toEqual([208, 152, 120, 85, 64, 0, 1]);
  expect(allocateSeats(shares, 630, "sainteLague", { percent: 5 })[6]).toBe(0);
});

test("gives no seats to exempt parties without votes", () => {
  expect(
    applyThreshold([0, 60, 40], { percent: 50, isExempt: [true, false, true] }),
  ).toEqual([0, 60, 40]);
  expect(
    allocateSeats([0, 600, 400], 5, "dHondt", {
      percent: 50,
      isExempt: [true],
    }),
  ).toEqual([0, 5, 0]);
});
