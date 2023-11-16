import getPoll from "../db/polls/get";
import getVotes from "../db/votes/get";
import type { Poll } from "../db/polls/types";
import type { Vote } from "../db/votes/types";

function isValidVoteNumber(n: number): boolean {
  return !Number.isNaN(n) && Number.isSafeInteger(n) && n >= 0 && n <= 3;
}

function redirectOut() {
  window.location.replace(`${window.location.origin}/c/`);
}

const eventId = new URL(window.location.href).searchParams.get("event");
if (!eventId || eventId.length < 18) {
  redirectOut();
  throw new Error("Invalid event id");
}

getPoll(eventId)
  .then((poll) => {
    getVotes(eventId)
      .then((votes) => {
        render(poll, votes);
      })
      .catch(redirectOut);
  })
  .catch(redirectOut);

type Time = {
  hourName: string;
  voters: string[][];
};
type Day = {
  weekdayNum: number;
  weekdayName: string;
  times: Time[];
};

function getDays(timestamps: number[], votes: Vote[]): Day[] {
  const days: Day[] = [];
  timestamps.forEach((ts) => {
    const date = new Date(ts);
    const time: Time = {
      hourName: date
        .toLocaleTimeString(undefined, { hour: "numeric" })
        .toLowerCase(),
      voters: [[], [], [], []] as string[][],
    };
    votes.forEach((voter) => {
      const voteNumber = Number(voter[ts]);
      const { name } = voter;
      if (isValidVoteNumber(voteNumber) && typeof name === "string") {
        time.voters[voteNumber].push(name);
      }
    });
    if (time.hourName.endsWith(" am") || time.hourName.endsWith(" pm")) {
      time.hourName = time.hourName.replace(" ", "");
    }
    const dayNum = date.getDay();
    const dayIndex = days.findIndex(({ weekdayNum }) => weekdayNum === dayNum);
    if (dayIndex >= 0) {
      days[dayIndex].times.push(time);
    } else {
      const weekdayName = date.toLocaleDateString(undefined, {
        weekday: "long",
      });
      days.push({
        weekdayNum: dayNum,
        weekdayName,
        times: [time],
      });
    }
  });
  days.sort((a, b) => a.weekdayNum - b.weekdayNum);
  return days;
}

const emojis = ["🟥", "🟨", "🟩", "🟦"];
const voteLabels = ["Busy", "Maybe", "Free", "Prefer"];

function renderVoters(voters: string[], vote: number): string {
  return `
    <p>
      <span class="emoji">${emojis[vote]} </span>
      <span><strong>${voteLabels[vote]}</strong>: </span>
      <span class="names">${voters.join(", ")}</span>
    </p>
  `;
}

function renderHour(hour: string, voters: string[][]): string {
  return `
    <div class="hour">
      <p class="title">${hour}</p>
      <div class="votes">
        ${voters
          .map((v, i) =>
            v.length > 0
              ? v.map(() => `<div class="vote vote-${i}"></div>`).join("\n")
              : null,
          )
          .filter((v) => v !== null)
          .join("\n")}
      </div>
      <div class="voters">
        ${voters
          .map((v, i) => (v.length > 0 ? renderVoters(v, i) : null))
          .filter((v) => v !== null)
          .join("\n")}
      </div>
    </div>
  `;
}

function renderDay(day: Day): string {
  return `
    <div class="day">
      <h4>${day.weekdayName}</h4>
      ${day.times
        .map(({ hourName, voters }) => renderHour(hourName, voters))
        .join("\n")}
    </div>
  `;
}

let timer: ReturnType<typeof setTimeout> | undefined = undefined;

function initShareButton(eventName: string) {
  const baseURL = "https://saywhen.netflify.app/";
  const url = `${window.location.origin}/vote/?event=${eventId}`;
  const shareButton = <HTMLButtonElement>document.getElementById("share")!;
  if (
    navigator &&
    navigator.canShare &&
    navigator.canShare({
      url: baseURL,
      text: "When are you free?",
      title: "Say When",
    })
  ) {
    const shareData = {
      url,
      text: `"${eventName}" • Let's plan! When are you free? Share your availability here.`,
      title: `"${eventName}" • Say When`,
    };
    shareButton.addEventListener("click", () => navigator.share(shareData));
  } else {
    shareButton.textContent = "Copy Vote Link";
    shareButton.addEventListener("click", () => {
      navigator.clipboard.writeText(url);
      shareButton.textContent = "✓ Got It!";
      clearTimeout(timer);
      timer = setTimeout(() => {
        shareButton.textContent = "Copy Vote Link";
      }, 3000);
    });
  }
}

function render(poll: Poll, votes: Vote[]) {
  document.title = `Poll: "${poll.name}" • Say When`;
  document.getElementById("event-name")!.textContent = `"${poll.name}"`;
  document.getElementById("loader")!.className = "hide";
  if (votes.length < 1) {
    document.getElementById("error")!.innerHTML = `
      <p class="error">Unfortunately it looks like no one has voted in this poll yet.</p>
      <a href="/vote/?event=${eventId}">Please go cast your vote here.</a>
    `;
    return;
  }
  const timestamps = [...poll.timestamps];
  timestamps.sort((a, b) => a - b);
  const days = getDays(timestamps, votes);
  document.getElementById("days")!.innerHTML = days.map(renderDay).join("\n");
  initShareButton(poll.name);
}
