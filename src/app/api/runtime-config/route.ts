export async function GET() {
  return loadRuntimeEnv();
}

async function loadRuntimeEnv() {
  const publicEnvVariables = Object.fromEntries(
    Object.entries(process.env).filter((entry) =>
      entry[0].startsWith("NEXT_PUBLIC_"),
    ),
  );

  return new Response(JSON.stringify(publicEnvVariables), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
