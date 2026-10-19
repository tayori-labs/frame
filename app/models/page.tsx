import { DATA } from "@/lib/data";
import { Table } from "@/components/ui";

export const metadata = { title: "Model directory" };

export default function Models() {
  const m = DATA.models;
  return (
    <>
      <h1>Model directory</h1>
      <p className="lead">Match the model to the task. Prices are approximate per-second generation costs.</p>
      <h2>Image models</h2>
      <Table heads={["Model", "Use it for"]} rows={m.image} />
      <h2>Video models</h2>
      <Table heads={["Model", "Use it for", "Cost"]} rows={m.video} />
      <h2>Supporting tools</h2>
      <Table heads={["Tool", "Role"]} rows={m.other} />
      <h2>More tools</h2>
      <Table heads={["Tool", "Use it for"]} rows={m.more} />
    </>
  );
}
