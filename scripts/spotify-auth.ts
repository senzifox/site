import { randomBytes } from "node:crypto";
import { createServer } from "node:http";

const PORT = 8888;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`;
const SCOPE = "user-read-currently-playing user-read-playback-state";

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  console.error("SPOTIFY_CLIENT_ID and/or SPOTIFY_CLIENT_SECRET not found in .env.local");
  process.exit(1);
}

const state = randomBytes(16).toString("hex");
const authorizeUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
  response_type: "code",
  client_id: clientId,
  scope: SCOPE,
  redirect_uri: REDIRECT_URI,
  state,
})}`;

const exchange = async (code: string) => {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: REDIRECT_URI }),
  });
  if (!response.ok) throw new Error(`token failed: ${response.status} ${await response.text()}`);
  return (await response.json()) as { refresh_token: string };
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", REDIRECT_URI);
  if (url.pathname !== "/callback") {
    res.writeHead(404).end();
    return;
  }
  const code = url.searchParams.get("code");
  if (url.searchParams.get("state") !== state || !code) {
    res.writeHead(400).end("invalid state or missing code");
    return;
  }
  try {
    const { refresh_token } = await exchange(code);
    res
      .writeHead(200, { "Content-Type": "text/plain; charset=utf-8" })
      .end("ref token recived, check console");
    console.log(`\nSPOTIFY_REFRESH_TOKEN=${refresh_token}\n`);
  } catch (error) {
    res.writeHead(500).end(String(error));
    console.error(error);
    process.exitCode = 1;
  }
  server.close();
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`redirect url: ${REDIRECT_URI}`);
  console.log(`authorize url:\n${authorizeUrl}`);
});
