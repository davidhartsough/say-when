export type Poll = {
  name: string;
  timestamps: number[];
};

function isValidTimeStampNumber(ts: number): boolean {
  return (
    typeof ts === "number" && Number.isSafeInteger(ts) && ts > 1600000000000
  );
}

export function isPoll(poll: Poll): poll is Poll {
  return (
    typeof poll.name === "string" &&
    poll.name.length > 1 &&
    Array.isArray(poll.timestamps) &&
    poll.timestamps.every(isValidTimeStampNumber)
  );
}
