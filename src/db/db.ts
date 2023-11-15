import { getFirestore } from "firebase/firestore/lite";
import app from "./fb";

const db = getFirestore(app);

export default db;
