import Builder from "@/components/Builder";

export const metadata = { title: "Prompt builder" };

export default function BuilderPage() {
  return (
    <>
      <h1>Prompt builder</h1>
      <p className="lead">
        Describe your idea, pick the video type and the look, and get a step-by-step plan with copy-ready prompts written for your idea, built on the workflows in
        this guide.
      </p>
      <Builder />
    </>
  );
}
