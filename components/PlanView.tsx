"use client";
import { guideTarget } from "@/lib/brief";
import type { Plan } from "@/lib/gemini";
import { List, Model, PromptBlock, StepHead } from "./ui";

export default function PlanView({
  plan,
  type,
}: {
  plan: Plan;
  type?: string;
}) {
  return (
    <>
      {plan.summary && <p className="lead">{plan.summary}</p>}
      {plan.steps.map((s, i) => {
        const guide = guideTarget(type || "", s);
        return (
          <section className="step" key={i}>
            <div className="step-top">
              <StepHead n={i + 1} title={s.title} />
              <a
                className="guide-link"
                href={guide.href}
                target="_blank"
                rel="noopener"
              >
                Guide: {guide.label} {"\u2197"}
              </a>
            </div>
            <h3>Tool</h3>
            <div className="models">
              <Model m={[s.tool, s.why]} />
            </div>
            {s.prompts?.length > 0 && (
              <>
                <h3>Prompts</h3>
                {s.prompts.map((x, j) => (
                  <PromptBlock key={j} label={x.label} text={x.text} />
                ))}
              </>
            )}
            {s.tips && s.tips.length > 0 && (
              <>
                <h3>Tips</h3>
                <List items={s.tips} className="tips" />
              </>
            )}
          </section>
        );
      })}
    </>
  );
}
