import { request as send } from "@/lib/http";

const API_URL = "https://stats.senzi.dev/api/v0/count";

export const countEvent = async (request: Request, path: string, title: string) => {
  const token = process.env.GOATCOUNTER_TOKEN;
  if (!token) return;
  const hit = {
    path,
    title,
    event: true,
    ref: request.headers.get("referer") ?? "",
    user_agent: request.headers.get("user-agent") ?? "",
    ip: request.headers.get("x-real-ip") ?? "",
  };
  try {
    const response = await send(API_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ no_sessions: true, hits: [hit] }),
    });
    if (!response.ok) console.error(`goatcounter event failed: ${response.status}`);
  } catch (error) {
    console.error(error);
  }
};
