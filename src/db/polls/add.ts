import { addDoc, collection } from "firebase/firestore/lite";
import db from "../db";
import { setBackup } from "./backup";
import type { Poll } from "./types";

export default async function addPoll(poll: Poll): Promise<string> {
  const docRef = await addDoc(collection(db, "polls"), poll);
  const { id } = docRef;
  setBackup(id, poll);
  return id;
}
