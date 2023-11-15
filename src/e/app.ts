import addPoll from "../db/polls/add";
import type { Poll } from "../db/polls/types";

const hoursInput = <HTMLInputElement>document.getElementById("hours")!;
const daysInput = <HTMLInputElement>document.getElementById("days")!;
const nameInput = <HTMLInputElement>document.getElementById("event-name")!;

function isValidNumber(n: number, max = 24): boolean {
  return !Number.isNaN(n) && Number.isSafeInteger(n) && n >= 0 && n < max;
}

function getNumsFromKebab(str: string, max = 24): number[] {
  return str
    .split("-")
    .map(Number)
    .filter((n) => isValidNumber(n, max))
    .sort((a, b) => a - b);
}

function redirectOut() {
  window.location.replace(`${window.location.origin}/c/`);
}

const keyNums = ["0", "1", "2", "3", "4", "5", "6"];

function setHiddenInputs() {
  const { searchParams } = new URL(window.location.href);
  const hoursParam = searchParams.get("h");
  if (!hoursParam || hoursParam.length < 1) {
    return redirectOut();
  }
  const hours: number[] = getNumsFromKebab(hoursParam, 24);
  const days: number[] = [];
  keyNums.forEach((keyNum, index) => {
    const day = searchParams.get(`d${keyNum}`);
    if (day === "1") {
      days.push(index);
    }
  });
  if (days.length < 1) {
    return redirectOut();
  }

  daysInput.value = days.join("-");
  hoursInput.value = hours.join("-");
}
setHiddenInputs();

function getTimestamps(days: number[], hours: number[]): number[] {
  const timestamps: number[] = [];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 1, 0);
  const tomorrowsWeekDay = tomorrow.getDay();
  days.forEach((dayNum) => {
    const date = new Date(tomorrow);
    if (dayNum > tomorrowsWeekDay) {
      date.setDate(date.getDate() + dayNum - tomorrowsWeekDay);
    } else if (dayNum < tomorrowsWeekDay) {
      date.setDate(date.getDate() + ((dayNum + (7 - tomorrowsWeekDay)) % 7));
    }
    hours.forEach((hourNum) => {
      date.setHours(hourNum);
      timestamps.push(date.getTime());
    });
  });
  return timestamps;
}

const submitButton = <HTMLButtonElement>document.getElementById("submit-btn")!;
function setLoading() {
  submitButton.disabled = true;
  document.getElementById("loader")!.className = "show";
}

function getPoll(): Poll {
  const name = nameInput.value;
  const days = getNumsFromKebab(daysInput.value, 7);
  const hours = getNumsFromKebab(hoursInput.value, 24);
  const timestamps = getTimestamps(days, hours);
  return { name, timestamps };
}

async function savePoll(poll: Poll) {
  const pollId = await addPoll(poll);
  window.location.href = `${window.location.origin}/vote/?event=${pollId}`;
}

document.getElementById("form")!.addEventListener("submit", (ev) => {
  setLoading();
  savePoll(getPoll());
  ev.preventDefault();
  return false;
});
