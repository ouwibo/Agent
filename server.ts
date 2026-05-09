import { Hono } from "hono";
import { serve } from "@hono/node-server";
import agentApi from "../backend-lib/agent-api";

const app = new Hono();

// Mount agent API
app.route("/api", agentApi);

// Serve frontend static files
app.get("*", async (c) => {
  const url = new URL(c.req.url);
  let path = url.pathname;
  
  // Serve index.html for SPA routes
  if (!path.includes(".") || path === "/") {
    path = "/index.html";
  }
  
  try {
    const file = Bun.file(`./frontend/dist${path}`);
    if (await file.exists()) {
      return new Response(file);
    }
  } catch {}
  
  return c.text("Not Found", 404);
});

const port = Number(process.env.PORT) || 3000;
console.log(`🚀 Server running on port ${port}`);

serve({ fetch: app.fetch, port });
