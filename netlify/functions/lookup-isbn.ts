import type { Handler } from "@netlify/functions";
import { lookupISBN } from "../../src/lib/isbn";

export const handler: Handler = async (event) => {
  const isbn = event.queryStringParameters?.isbn;
  if (!isbn) {
    return { statusCode: 400, body: JSON.stringify({ error: "ISBN required" }) };
  }

  try {
    const result = await lookupISBN(isbn);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    };
  } catch {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to lookup ISBN" }),
    };
  }
};
