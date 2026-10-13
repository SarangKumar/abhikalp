import "server-only";

/**
 * OpenAI-compatible chat. Works with OpenAI or any compatible endpoint
 * (OPENAI_BASE_URL). Without OPENAI_API_KEY the AI features show a
 * "not configured" state instead of failing.
 */
export function isAiConfigured() {
  const key = process.env.OPENAI_API_KEY;
  return Boolean(
    key && key.length > 20 && !/x{3,}|your|placeholder/i.test(key)
  );
}

export function resolveModel(planModel: string) {
  return process.env.AI_MODEL || planModel;
}

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

/** Stream the assistant's reply as plain text chunks. */
export async function streamChat(model: string, messages: ChatMessage[]) {
  const base = (
    process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"
  ).replace(/\/$/, "");
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ model, messages, stream: true, temperature: 0.4 }),
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    throw new Error(`AI provider error ${res.status}: ${detail.slice(0, 200)}`);
  }

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  return res.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const data = line.replace(/^data:\s*/, "").trim();
          if (!data || data === "[DONE]" || !line.startsWith("data:")) continue;
          try {
            const delta = JSON.parse(data).choices?.[0]?.delta?.content;
            if (delta) controller.enqueue(encoder.encode(delta));
          } catch {
            // ignore keep-alives / partial frames
          }
        }
      },
    })
  );
}
