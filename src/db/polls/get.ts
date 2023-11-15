import { doc, getDoc } from "firebase/firestore/lite";
import db from "../db";
import { getBackup, setBackup } from "./backup";
import type { Poll } from "./types";

export default async function getPoll(id: string): Promise<Poll> {
  const backup = getBackup(id);
  if (backup) return backup;
  const docSnap = await getDoc(doc(db, "polls", id));
  if (docSnap.exists()) {
    const poll = docSnap.data() as Poll;
    setBackup(id, poll);
    return poll;
  } else {
    throw new Error("404: No Poll");
  }
}
