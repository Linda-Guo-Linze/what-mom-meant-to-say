export async function GET() {
  const liveConfigured = Boolean(
    process.env.MODEL_API_URL?.trim() &&
      process.env.MODEL_API_KEY?.trim() &&
      process.env.MODEL_NAME?.trim(),
  );

  return Response.json(
    {
      demoReady: true,
      liveAdapterReady: true,
      liveConfigured,
      speechEngine: "browser-speech-synthesis",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
