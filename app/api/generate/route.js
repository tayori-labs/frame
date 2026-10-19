import { buildBrief, validateForm } from "@/lib/brief";
import { DEFAULT_MODEL, generatePlan, resolveKey } from "@/lib/gemini";

export async function POST(req) {
  try {
    const body = await req.json();
    const key = resolveKey(req.headers.get("x-user-key"));
    if (!key) return Response.json({ error: "No Gemini API key. Add one in the settings above." }, { status: 400 });
    const plan = await generatePlan(key, body.model || DEFAULT_MODEL, buildBrief(validateForm(body.form)));
    return Response.json({ plan });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 400 });
  }
}
