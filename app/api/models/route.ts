import { listModels, resolveKey } from "@/lib/gemini";

export async function GET(req: Request) {
  const serverKey = Boolean(process.env.GEMINI_API_KEY);
  const key = resolveKey(req.headers.get("x-user-key"));
  if (!key) return Response.json({ serverKey, models: [], imageModels: [] });
  try {
    const { text, image } = await listModels(key);
    return Response.json({ serverKey, models: text, imageModels: image });
  } catch (e) {
    return Response.json({ serverKey, error: (e as Error).message }, { status: 400 });
  }
}
