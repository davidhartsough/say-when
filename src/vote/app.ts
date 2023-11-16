import getPoll from "../db/polls/get";
import type { Poll } from "../db/polls/types";

function redirectOut() {
  window.location.replace(`${window.location.origin}/c/`);
}

const eventId = new URL(window.location.href).searchParams.get("event");
if (!eventId || eventId.length < 18) {
  redirectOut();
  throw new Error("Invalid event id");
}

getPoll(eventId).then(render); //.catch(redirectOut);

type Time = {
  hourNum: number;
  hourName: string;
  timestamp: number;
  chunk: number;
};
type Day = {
  weekdayNum: number;
  weekdayName: string;
  times: Time[];
  chunks: Time[][];
};

function getDays(timestamps: number[]): Day[] {
  const days: Day[] = [];
  timestamps.forEach((ts) => {
    const date = new Date(ts);
    const time: Time = {
      hourNum: date.getHours(),
      hourName: date
        .toLocaleTimeString(undefined, { hour: "numeric" })
        .toLowerCase(),
      timestamp: ts,
      chunk: 0,
    };
    if (time.hourName.endsWith(" am") || time.hourName.endsWith(" pm")) {
      time.hourName = time.hourName.replace(" ", "");
    }
    const dayNum = date.getDay();
    const dayIndex = days.findIndex(({ weekdayNum }) => weekdayNum === dayNum);
    if (dayIndex >= 0) {
      const prev = days[dayIndex].times[days[dayIndex].times.length - 1];
      if (prev.hourNum === time.hourNum - 1) {
        time.chunk = prev.chunk;
      } else {
        time.chunk = prev.chunk + 1;
      }
      days[dayIndex].times.push(time);
      if (Array.isArray(days[dayIndex].chunks[time.chunk])) {
        days[dayIndex].chunks[time.chunk].push(time);
      } else {
        days[dayIndex].chunks.push([time]);
      }
    } else {
      const weekdayName = date.toLocaleDateString(undefined, {
        weekday: "long",
      });
      days.push({
        weekdayNum: dayNum,
        weekdayName,
        times: [time],
        chunks: [[time]],
      });
    }
  });
  days.sort((a, b) => a.weekdayNum - b.weekdayNum);
  return days;
}

const voteToSubmit: Record<string, number> = {};

const getElem = (id: string) => document.getElementById(id);
const dayTemplate = <HTMLTemplateElement>getElem("day-template")!;
const chunkTemplate = <HTMLTemplateElement>getElem("chunk-template")!;
const chunkHeaderTemplate = <HTMLTemplateElement>(
  getElem("chunk-header-template")!
);
const hourTemplate = <HTMLTemplateElement>getElem("hour-template")!;
const daysContainer = <HTMLDivElement>getElem("days")!;
const submitBtn = <HTMLButtonElement>getElem("submit")!;

const cloneDay = () => dayTemplate.content.cloneNode(true) as HTMLDivElement;
const cloneChunk = () =>
  chunkTemplate.content.cloneNode(true) as HTMLDivElement;
const cloneChunkHeader = () =>
  chunkHeaderTemplate.content.cloneNode(true) as HTMLDivElement;
const cloneHour = () => hourTemplate.content.cloneNode(true) as HTMLDivElement;

function checkVotes() {
  const isReady = Object.values(voteToSubmit).every((v) => v >= 0);
  submitBtn.disabled = !isReady;
  submitBtn.title = isReady ? "" : "Please vote for all time slots";
}

function getHourDiv(hourName: string, timestamp: number, chunkNum: number) {
  const clone = cloneHour();
  clone.id = `hour-${timestamp}`;
  const hiddenInput = clone.querySelector(
    `input[type="hidden"]`,
  )! as HTMLInputElement;
  hiddenInput.id = `ts-${timestamp}`;
  clone.querySelector(".hour")!.textContent = hourName;
  const buttons = clone.querySelectorAll(".vote-btn");
  buttons.forEach((voteBtn, i) => {
    voteBtn.addEventListener("click", (ev) => {
      const btn = ev.currentTarget as HTMLButtonElement;
      buttons.forEach((b) => {
        b.classList.remove("selected");
        b.classList.add("unselected");
      });
      btn.classList.remove("unselected");
      btn.classList.add("selected");
      const select = getElem(`set-chunk-${chunkNum}`);
      if (select) {
        (select as HTMLSelectElement).value = "";
      }
      hiddenInput.value = i.toString();
      voteToSubmit[timestamp] = i;
      checkVotes();
    });
  });
  return clone;
}
function getChunkHeaderDiv(id: string): HTMLDivElement {
  const clone = cloneChunkHeader();
  const select = clone.querySelector("select")!;
  select.id = `set-${id}`;
  select.addEventListener("change", (ev) => {
    const { value } = ev.target as HTMLSelectElement;
    const chunkDiv = getElem(id)! as HTMLDivElement;
    chunkDiv.querySelectorAll(`.vote-${value}`).forEach((btn) => {
      (btn as HTMLButtonElement).click();
    });
  });
  return clone;
}
function getChunkDiv(chunk: Time[], dayIndex: number): HTMLDivElement {
  const clone = cloneChunk();
  const chunkBody = clone.querySelector(".chunk-body")!;
  chunk.forEach(({ hourName, timestamp, chunk }) => {
    chunkBody.appendChild(getHourDiv(hourName, timestamp, chunk));
  });
  if (chunk.length > 1) {
    const chunkNum = chunk[0].chunk;
    const id = `chunk-${dayIndex}-${chunkNum}`;
    chunkBody.id = id;
    const header = getChunkHeaderDiv(id);
    clone.querySelector(".chunk-header")!.appendChild(header);
  }
  return clone;
}
function getDayDiv(day: Day, index: number): HTMLDivElement {
  const clone = cloneDay();
  clone.querySelector("h4")!.textContent = day.weekdayName;
  const chunkContainer = clone.querySelector(".chunks")!;
  day.chunks.forEach((chunk) => {
    chunkContainer.appendChild(getChunkDiv(chunk, index));
  });
  return clone;
}

function render(poll: Poll) {
  document.title = `Vote: "${poll.name}" • Say When`;
  getElem("event-name")!.innerText = `"${poll.name}"`;
  getElem("loader")!.className = "hide";
  const timestamps = [...poll.timestamps];
  timestamps.sort((a, b) => a - b);
  timestamps.forEach((ts) => {
    voteToSubmit[ts] = -1;
  });
  const days = getDays(timestamps);
  days.forEach((day, i) => {
    daysContainer.appendChild(getDayDiv(day, i));
  });
}
