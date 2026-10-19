import { resolveKey, tryPrompt } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const key = resolveKey(req.headers.get("x-user-key"));
    if (!key) return Response.json({ error: "No Gemini API key. Add one under Gemini key in the sidebar." }, { status: 400 });
    return Response.json(await tryPrompt(key, await req.json()));
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}
