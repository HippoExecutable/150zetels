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

export type AllocationMethod = "dHondt" | "sainteLague" | "largestRemainder";

export const allocationMethods: AllocationMethod[] = [
  "dHondt",
  "sainteLague",
  "largestRemainder",
];

// Divisors of the highest averages methods, by the seats a party already won
const divisors = {
  dHondt: (seats: number) => seats + 1,
  sainteLague: (seats: number) => 2 * seats + 1,
};

export function sumVotes(votes: number[]) {
  return votes.reduce((acc, count) => acc + Math.max(count, 0), 0);
}

// Vote shares are out of 100 even when some parties are not listed, while
// vote counts are out of the votes entered
export function getDefaultTotalVotes(votes: number[]) {
  const enteredVotes = sumVotes(votes);
  return enteredVotes <= 100 ? 100 : enteredVotes;
}

export interface Threshold {
  // Percentage of all votes a party needs to win seats
  percent?: number;
  // All votes, including those for parties that are not listed
  totalVotes?: number;
  // Parties that win seats even below the threshold, by index, like the
  // Danish minority's SSW in Germany
  isExempt?: boolean[];
}

// Leaves out the votes of parties below the threshold. Like the German 5%
// clause, the total includes the votes of parties that are not listed, but it
// can never be less than the votes entered.
export function applyThreshold(
  votes: number[],
  {
    percent = 0,
    totalVotes = getDefaultTotalVotes(votes),
    isExempt = [],
  }: Threshold = {},
) {
  const allVotes = Math.max(totalVotes, sumVotes(votes));

  return votes.map((count, index) =>
    count > 0 && (isExempt[index] || count * 100 >= percent * allVotes)
      ? count
      : 0,
  );
}

// Splits the seats in proportion to the votes of the parties that pass the
// threshold. Ties go to the party with more votes, then to the one listed first.
export function allocateSeats(
  votes: number[],
  totalSeats: number,
  method: AllocationMethod,
  threshold: Threshold = {},
) {
  const eligibleVotes = applyThreshold(votes, threshold);
  const totalEligibleVotes = eligibleVotes.reduce(
    (acc, count) => acc + count,
    0,
  );
  const seats = votes.map(() => 0);

  if (totalSeats <= 0 || totalEligibleVotes === 0) return seats;

  if (method === "largestRemainder") {
    // Every whole Hare quota is a seat, and the seats left over go to the
    // largest remainders
    const remainders = eligibleVotes.map((count, index) => {
      seats[index] = Math.floor((count * totalSeats) / totalEligibleVotes);
      return count * totalSeats - seats[index] * totalEligibleVotes;
    });
    const seatsLeft = totalSeats - seats.reduce((acc, count) => acc + count, 0);

    eligibleVotes
      .map((_, index) => index)
      .sort(
        (a, b) =>
          remainders[b] - remainders[a] ||
          eligibleVotes[b] - eligibleVotes[a] ||
          a - b,
      )
      .slice(0, seatsLeft)
      .forEach((index) => seats[index]++);

    return seats;
  }

  const divisor = divisors[method];

  // Each seat goes to the party with the highest votes per divisor
  for (let seat = 0; seat < totalSeats; seat++) {
    let winner = -1;

    eligibleVotes.forEach((count, index) => {
      if (count === 0) return;
      if (winner === -1) {
        winner = index;
        return;
      }

      // Compares the averages without dividing, so ties stay exact
      const difference =
        count * divisor(seats[winner]) -
        eligibleVotes[winner] * divisor(seats[index]);

      if (
        difference > 0 ||
        (difference === 0 && count > eligibleVotes[winner])
      ) {
        winner = index;
      }
    });

    seats[winner]++;
  }

  return seats;
}
