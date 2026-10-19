import { DATA } from "@/lib/data";
import { Diagram, List, PromptBlock } from "@/components/ui";

export const metadata = { title: "Prompt templates" };

export default function Templates() {
  return (
    <>
      <h1>Prompt templates</h1>
      <p className="lead">Reusable skeletons. Replace the highlighted placeholders.</p>
      {DATA.templates.map(([label, text, diagram]) => (
        <div key={label}>
          <Diagram name={diagram} />
          <PromptBlock label={label} text={text} />
        </div>
      ))}
      <h2>Character sheet checklist</h2>
      <List
        items={[
          "16:9 split into 3 equal panels: close-up, front full body, back full body.",
          "Flat grey background. White blows out skin and makes it look plastic.",
          "Erase the face on the front full-body panel so the close-up is the only face reference.",
          "Iterate on high-quality settings in a capable image model.",
        ]}
      />
      <h2>Every plot beat answers 4 questions</h2>
      <List items={["Shot size + angle", "Camera motion", "The action", "The transition into the next beat (cut, whip pan, match cut)"]} />
    </>
  );
}
