function isValidHourNumber(n: number): boolean {
  return !Number.isNaN(n) && Number.isSafeInteger(n) && n >= 0 && n < 24;
}
function getIndex(n: number): number {
  return n <= 23 ? n : n - 24;
}
const hoursNumbers = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 0,
];
const hoursTitles = [
  "1am",
  "2am",
  "3am",
  "4am",
  "5am",
  "6am",
  "7am",
  "8am",
  "9am",
  "10am",
  "11am",
  "12pm",
  "1pm",
  "2pm",
  "3pm",
  "4pm",
  "5pm",
  "6pm",
  "7pm",
  "8pm",
  "9pm",
  "10pm",
  "11pm",
  "12am",
];

const { searchParams } = new URL(window.location.href);
const hourIndexesStr = searchParams.get("h");
if (!hourIndexesStr || hourIndexesStr.length < 1) {
  window.location.replace(`${window.location.origin}/c/`);
}

const hourIndexes = hourIndexesStr!
  .split("-")
  .map(Number)
  .filter(isValidHourNumber);
const indexes = hourIndexes.map((hi) => getIndex(hi + 5));
const hours = indexes
  .map((i) => ({
    text: hoursTitles[i],
    num: hoursNumbers[i],
  }))
  .sort((a, b) => a.num - b.num);

const hiddenInput = <HTMLInputElement>document.getElementById("h")!;
hiddenInput.value = hours.map(({ num }) => num).join("-");
const hoursSpan = <HTMLSpanElement>document.getElementById("hours-list")!;
hoursSpan.innerHTML = hours.map(({ text }) => text).join(", ");
