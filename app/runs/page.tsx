import type { Metadata } from "next";
import { RunsIndex } from "@/components/Runs";

export const metadata: Metadata = { title: "Saved runs" };

export default function Page() {
  return <RunsIndex />;
}
