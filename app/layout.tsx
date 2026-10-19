import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import KeyDialog from "@/components/KeyDialog";
import { DATA } from "@/lib/data";

export const metadata: Metadata = {
  title: { default: "Frame - AI video generation guide", template: "%s - Frame" },
  description: "Step-by-step AI video workflows, model picks and copy-ready prompts, plus an AI prompt builder.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const workflows = DATA.categories.map(({ id, name, steps }) => ({ id, name, steps: steps.map((s) => s.title) }));
  return (
    <html lang="en">
      <body>
        <div className="layout">
          <Sidebar workflows={workflows} />
          <main id="main">
            {children}
            <footer className="site-footer">
              <span>&copy; 2026 Tayori Labs. All rights reserved.</span>
              <a href="https://github.com/tayori-labs/frame" target="_blank" rel="noopener">GitHub</a>
            </footer>
          </main>
        </div>
        <KeyDialog />
      </body>
    </html>
  );
}
