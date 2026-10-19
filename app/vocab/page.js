import { DATA } from "@/lib/data";
import { Diagram, PromptBlock, Table } from "@/components/ui";

export const metadata = { title: "Prompt vocabulary" };

const Part = ({ k, children }) => {
  const [name, color] = DATA.promptParts[k];
  return <span className="pp" style={{ "--c": color }} title={name}>{children}</span>;
};

export default function Vocab() {
  const v = DATA.vocab;
  const term = (title, rows, head = "The look it gives", diagram) => (
    <>
      <h2>{title}</h2>
      <Diagram name={diagram} />
      <Table heads={["Term", head]} rows={rows} copyFirst />
    </>
  );
  return (
    <>
      <h1>Prompt vocabulary</h1>
      <p className="lead">The dials every cinematographer controls. Click a term to copy it.</p>
      <Diagram name="promptMap" />

      <h2>Full examples</h2>
      <p className="lead">Every example uses the same order. Swap one coloured part to change one dial.</p>
      <div className="legend">
        {Object.entries(DATA.promptParts).map(([k, [name]]) => <Part key={k} k={k}>{name}</Part>)}
      </div>
      {DATA.vocabExamples.map(([label, parts]) => (
        <PromptBlock key={label} label={label} text={parts.map((p) => p[1]).join(" ")}>
          {parts.map(([k, t], i) => (
            <span key={i}>{i > 0 && " "}<Part k={k}>{t}</Part></span>
          ))}
        </PromptBlock>
      ))}

      {term("Camera body", v.camera)}
      {term("Lens", v.lens)}
      {term("Director / DP style", v.director)}
      {term("Lighting", v.lighting, "When to use")}
      {term("Shot size", v.shots, "When to use", "shotSizes")}
      {term("Camera angle", v.angles, "When to use", "cameraAngles")}
      {term("Camera movement", v.moves, "Effect")}
    </>
  );
}
