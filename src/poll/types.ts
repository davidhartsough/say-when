export type Tier = "BUSY" | "MAYBE" | "FREE" | "PREFER";
const tiers = ["BUSY", "MAYBE", "FREE", "PREFER"];
export function isTier(tier: Tier): tier is Tier {
  return typeof tier === "string" && tiers.includes(tier);
}
export type TierKeyOption = "busy" | "maybe" | "free" | "prefer";
export const tierKeys: TierKeyOption[] = ["busy", "maybe", "free", "prefer"];
export type VoterData = {
  [key in TierKeyOption]: string[];
};
export interface VotersData {
  busy: string[];
  maybe: string[];
  free: string[];
  prefer: string[];
}
export type TierKey = keyof VotersData;
