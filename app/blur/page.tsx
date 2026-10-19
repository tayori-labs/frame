import BlurTool from "@/components/BlurTool";

export const metadata = { title: "Face blur" };

export default function BlurPage() {
  return (
    <>
      <h1>Face blur</h1>
      <p className="lead">
        Paint over the face on the front full-body panel. Blur it, or cover it
        with the sheet&apos;s grey, so the close-up stays the only face
        reference. The image never leaves this browser.
      </p>
      <BlurTool />
    </>
  );
}
