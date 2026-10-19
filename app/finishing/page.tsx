import { DATA } from "@/lib/data";
import { Diagram, List, Table } from "@/components/ui";

export const metadata = { title: "Finishing in Topaz" };

export default function Finishing() {
  const t = DATA.topaz;
  return (
    <>
      <h1>Finishing in Topaz</h1>
      <p className="lead">
        <a href="https://www.topazlabs.com/topaz-video" target="_blank" rel="noopener">Topaz Video</a> (formerly Topaz Video AI) is a paid desktop app from Topaz Labs that
        uses AI to upscale video (e.g. 720p to 1080p/4K) and interpolate frames for smoother motion. Generate at 720p to save cost, then upscale and smooth here. These
        settings are tuned for Instagram reels.
      </p>
      <Diagram name="topazFlow" />
      <h2>Enhancement</h2>
      <Table heads={["Setting", "Value"]} rows={t.enhancement} />
      <h2>Frame interpolation</h2>
      <Table heads={["Setting", "Value"]} rows={t.interpolation} />
      <h2>Notes</h2>
      <List items={t.notes} />
    </>
  );
}
