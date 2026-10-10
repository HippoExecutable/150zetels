import { MajorityThreshold } from "@/types";

export const simpleMajority: MajorityThreshold = {
  numerator: 1,
  denominator: 2,
};

export function isSameThreshold(a: MajorityThreshold, b: MajorityThreshold) {
  return a.numerator * b.denominator === b.numerator * a.denominator;
}

export function getMajority(
  totalSeats: number,
  selectedSeats: number,
  allowTieBreaker: boolean = false,
  threshold: MajorityThreshold = simpleMajority,
): {
  seatsForMajority: number;
  status: "all" | "majority" | "tie-breaking majority" | "minority" | "none";
  margin: number;
} {
  const { numerator, denominator } = threshold;
  const quota = Math.floor((totalSeats * numerator) / denominator);
  const isExactQuota = (totalSeats * numerator) % denominator === 0;

  // Supermajorities (e.g. 2/3) are reached at exactly the quota, while
  // thresholds up to one half must be exceeded: more than half, or more than
  // a third to block a 2/3 vote. Exactly half is a tie unless tie breaking.
  const isTieBreak =
    allowTieBreaker &&
    isSameThreshold(threshold, simpleMajority) &&
    isExactQuota;
  const isQuotaEnough =
    isTieBreak || (2 * numerator > denominator && isExactQuota);

  const majorityThreshold =
    totalSeats === 0 ? 0 : isQuotaEnough ? quota : quota + 1;

  // Selected all parties
  if (selectedSeats === totalSeats) {
    return {
      seatsForMajority: majorityThreshold,
      status: "all",
      margin: 0,
    };
  }

  // Selected no parties
  if (selectedSeats === 0) {
    return {
      seatsForMajority: majorityThreshold,
      status: "none",
      margin: majorityThreshold,
    };
  }

  // Tie-breaking majority
  if (isTieBreak && majorityThreshold === selectedSeats) {
    return {
      seatsForMajority: majorityThreshold,
      status: "tie-breaking majority",
      margin: 0,
    };
  }

  // Majority achieved
  if (majorityThreshold <= selectedSeats) {
    return {
      seatsForMajority: majorityThreshold,
      status: "majority",
      margin: selectedSeats - majorityThreshold + (isTieBreak ? 0 : 1),
    };
  }

  // Not yet a majority
  return {
    seatsForMajority: majorityThreshold,
    status: "minority",
    margin: majorityThreshold - selectedSeats,
  };
}
