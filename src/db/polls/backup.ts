import { Poll, isPoll } from "./types";

function getKey(id: string): string {
  return `poll--${id}`;
}

export function getBackup(id: string): Poll | false {
  const backup = window.localStorage.getItem(getKey(id));
  if (backup) {
    const poll = JSON.parse(backup);
    if (isPoll(poll)) return poll;
  }
  return false;
}

export function setBackup(id: string, poll: Poll) {
  window.localStorage.setItem(getKey(id), JSON.stringify(poll));
}
