import { collection, query, where, getDocs } from "firebase/firestore/lite";
import db from "../db";
import type { Vote } from "./types";

export default async function getVotes(eventId: string): Promise<Vote[]> {
  const q = query(collection(db, "votes"), where("poll", "==", eventId));
  const qs = await getDocs(q);
  return qs.docs.map((doc) => doc.data());
}
