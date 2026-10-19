import { notFound } from "next/navigation";
import { DATA } from "@/lib/data";
import { Diagram, List, Model, PromptBlock, StepHead } from "@/components/ui";

type Props = { params: Promise<{ id: string }> };

const find = (id: string) => DATA.categories.find((c) => c.id === id);

export const dynamicParams = false;
export const generateStaticParams = () => DATA.categories.map((c) => ({ id: c.id }));

export async function generateMetadata({ params }: Props) {
  return { title: find((await params).id)?.name };
}

export default async function Workflow({ params }: Props) {
  const c = find((await params).id);
  if (!c) notFound();
  return (
    <>
      <h1>{c.name}</h1>
      <p className="lead">{c.tagline}</p>
      <div className="meta">
        <span className="pill">{c.specs}</span>
      </div>
      {c.steps.map((s, i) => (
        <section className="step" id={`step-${i + 1}`} key={s.title}>
          <StepHead n={i + 1} title={s.title} />
          {s.req.length > 0 && (<><h3>Requirements</h3><List items={s.req} /></>)}
          {s.models.length > 0 && (<><h3>Suggested models</h3><div className="models">{s.models.map((m) => <Model key={m[0]} m={m} />)}</div></>)}
          {s.alt.length > 0 && (<><h3>Alternatives</h3><div className="models">{s.alt.map((m) => <Model key={m[0]} m={m} alt />)}</div></>)}
          {s.tips.length > 0 && (<><h3>Tips</h3><List items={s.tips} className="tips" /></>)}
          <Diagram name={s.diagram} />
          {s.prompts.length > 0 && (<><h3>Prompts</h3>{s.prompts.map((p) => <PromptBlock key={p.label} label={p.label} text={p.text} />)}</>)}
        </section>
      ))}
    </>
  );
}
