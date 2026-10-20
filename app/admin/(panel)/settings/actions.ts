"use server";
import { skipcashEnabled, skipcashLive } from "@/lib/skipcash";

/** Whether SkipCash keys are set in Vercel (no secrets are returned). */
export async function skipcashStatus(): Promise<{ configured: boolean; live: boolean }> {
  return { configured: skipcashEnabled, live: skipcashEnabled && skipcashLive };
}
