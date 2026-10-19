import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { DATA } from "@/lib/data";

export const metadata = {
  title: { default: "Frame - AI video generation guide", template: "%s - Frame" },
  description: "Step-by-step AI video workflows, model picks and copy-ready prompts, plus an AI prompt builder.",
};

export default function RootLayout({ children }) {
  const workflows = DATA.categories.map(({ id, name, steps }) => ({ id, name, steps: steps.map((s) => s.title) }));
  return (
    <html lang="en">
      <body>
        <div className="layout">
          <Sidebar workflows={workflows} />
          <main id="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
