import type { Handler } from "@netlify/functions";

const DATA_URL = process.env.DATA_STORE_URL || "";

export const handler: Handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }

  try {
    switch (event.httpMethod) {
      case "GET": {
        if (DATA_URL) {
          const resp = await fetch(DATA_URL);
          const data = await resp.json();
          return { statusCode: 200, headers, body: JSON.stringify(data) };
        }
        return { statusCode: 200, headers, body: JSON.stringify([]) };
      }
      case "POST": {
        if (DATA_URL && event.body) {
          await fetch(DATA_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: event.body,
          });
        }
        return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
      }
      default:
        return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
    }
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: String(e) }) };
  }
};
