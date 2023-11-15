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

getPoll(eventId).then(render).catch(redirectOut);

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

const emojis = ["🟥", "🟨", "🟩", "🟦"];
const voteLabels = ["Busy", "Maybe", "Free", "Prefer"];

function getChunkRange(chunk: Time[]): string {
  const start = chunk[0].hourName;
  const end = chunk[chunk.length - 1].hourName;
  if (start.endsWith("am") && end.endsWith("am")) {
    return `${start.replace("am", "")}-${end}`;
  }
  if (start.endsWith("pm") && end.endsWith("pm")) {
    return `${start.replace("pm", "")}-${end}`;
  }
  return `${start}-${end}`;
}

function renderHourVote(vote: number | undefined = undefined): string {
  return `
    <div class="hour-vote${vote ? " selected" : ""}">
      ${
        vote
          ? `
        <p>
          <strong>${voteLabels[vote]}</strong>
        </p>`
          : `
        <div class="options">
          ${voteLabels
            .map(
              (label, i) =>
                `<button class="vote-btn vote-${i}">${label}</button>`,
            )
            .join("\n")}
        </div>`
      }
    </div>
  `;
}

function renderHour(hourName: string, timestamp: number): string {
  return `
    <div class="row" id="ts-${timestamp}">
      <p class="hour">${hourName}</p>
      ${renderHourVote()}
    </div>
  `;
}

function renderChunkHeader(chunk: Time[]): string {
  return `
    <div class="chunk-header">
      <p class="chunk-title">${getChunkRange(chunk)}</p>
      <div class="dropdown-icon">
        <div class="dropdown-icon-circle">
          <div class="dropdown-icon-arrow"></div>
        </div>
      </div>
      <select>
        <option hidden selected value label=" "> </option>
        ${voteLabels
          .map(
            (label, i) => `
          <option value="${i}">
            ${emojis[i]} ${label}
          </option>
        `,
          )
          .join("\n")}
      </select>
    </div>
  `;
}

function renderChunk(chunk: Time[]): string {
  if (chunk.length === 1) {
    return `<div class="chunk"><p>${chunk[0].hourName}</p></div>`;
  }
  const hours = chunk.map(({ hourName, timestamp }) =>
    renderHour(hourName, timestamp),
  );
  return `
    <div class="chunk">
      ${renderChunkHeader(chunk)}
      <div class="chunk-body">
        ${hours.join("\n")}
      </div>
    </div>
  `;
}

function renderDay(day: Day): string {
  return `
    <div class="day">
      <h4>${day.weekdayName}</h4>
      ${day.chunks.map(renderChunk).join("\n")}
    </div>
  `;
}

function render(poll: Poll) {
  document.title = `Vote: "${poll.name}" • Say When`;
  document.getElementById("event-name")!.innerText = `"${poll.name}"`;
  document.getElementById("loader")!.className = "hide";
  const timestamps = [...poll.timestamps];
  timestamps.sort((a, b) => a - b);
  const days = getDays(timestamps);
  console.log("days:", days);
  document.getElementById("days")!.innerHTML = days.map(renderDay).join("\n");
}
