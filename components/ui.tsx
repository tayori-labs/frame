import CopyButton from "./CopyButton";
export { default as PromptBlock, Highlight } from "./PromptBlock";
import { DIAGRAMS, type DiagramName } from "@/lib/diagrams";

// Diagram markup is static, ASCII-only SVG authored in lib/diagrams.ts.
export const Diagram = ({ name }: { name?: DiagramName }) => (name ? <figure className="diagram" dangerouslySetInnerHTML={{ __html: DIAGRAMS[name] }} /> : null);

export const Model = ({ m: [name, why], alt }: { m: [string, string]; alt?: boolean }) => (
  <div className={`model${alt ? " alt" : ""}`}>
    <b>{name}</b>
    {why && <span>{why}</span>}
  </div>
);

export function Table({ heads, rows, copyFirst }: { heads: string[]; rows: string[][]; copyFirst?: boolean }) {
  return (
    <table>
      <thead>
        <tr>{heads.map((h) => <th key={h}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r[0]}>
            {r.map((c, j) => (
              <td key={j}>{j === 0 && copyFirst ? <CopyButton className="term" text={c} doneLabel={c}>{c}</CopyButton> : c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function StepHead({ n, title }: { n: number; title: string }) {
  return (
    <div className="step-head">
      <span className="num">{n}</span>
      <h2>{title}</h2>
    </div>
  );
}

export const List = ({ items, className }: { items: string[]; className?: string }) => (
  <ul className={className}>
    {items.map((x) => <li key={x}>{x}</li>)}
  </ul>
);
