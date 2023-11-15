import { collection, addDoc } from "firebase/firestore/lite";
import db from "../db";
import { HourVotes } from "./types";

export default async function addVote(
  eventId: string,
  name: string,
  votes: HourVotes,
): Promise<boolean> {
  await addDoc(collection(db, "votes"), {
    poll: eventId,
    name,
    ...votes,
  });
  return true;
}
