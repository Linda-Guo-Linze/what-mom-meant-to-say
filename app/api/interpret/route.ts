import { getInterpretationProvider } from "../../../src/lib/interpretation";
import { DemoInterpretationProvider } from "../../../src/lib/interpretation/demo-provider";
import { consumeLiveRequest } from "../../../src/lib/rate-limit";
import { interpretationInputSchema } from "../../../src/lib/schemas";

function requestIp(request: Request): string {
  return request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "The request body must be valid JSON." }, { status: 400 }); }
  const parsed = interpretationInputSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Please review the form fields.", issues: parsed.error.flatten().fieldErrors }, { status: 400 });

  const input = parsed.data;
  if (input.requestedMode === "live") {
    const allowance = consumeLiveRequest(requestIp(request));
    if (!allowance.allowed) {
      const result = await new DemoInterpretationProvider().interpret({ ...input, requestedMode: "demo" });
      return Response.json(result, { headers: { "Cache-Control": "no-store", "X-Live-Fallback": "rate-limit", "Retry-After": String(allowance.retryAfterSeconds) } });
    }
  }

  try {
    const result = await getInterpretationProvider(input.requestedMode).interpret(input);
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch {
    if (input.requestedMode === "live") {
      const result = await new DemoInterpretationProvider().interpret({ ...input, requestedMode: "demo" });
      return Response.json(result, { headers: { "Cache-Control": "no-store", "X-Live-Fallback": "provider-unavailable" } });
    }
    return Response.json({ error: "The safe response could not load. Please try again." }, { status: 500 });
  }
}
