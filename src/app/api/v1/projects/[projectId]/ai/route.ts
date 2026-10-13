import { z } from "zod";

import { getSubscriptionConfig } from "@/config/subscription";
import { siteConfig } from "@/config/site";
import { isAiConfigured, resolveModel, streamChat } from "@/lib/ai";
import { jsonError, parseBody, requireProject, type RouteCtx } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const schema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(8000),
      })
    )
    .min(1)
    .max(40),
});

/** Project-aware assistant. Streams plain text. */
export async function POST(req: Request, { params }: RouteCtx) {
  if (!isAiConfigured()) {
    return jsonError(
      "AI assistant is not configured. Set OPENAI_API_KEY.",
      503
    );
  }
  const ctx = await requireProject((await params).projectId, "read");
  if ("error" in ctx) return ctx.error;
  const body = await parseBody(req, schema);
  if ("error" in body) return body.error;

  const { project, user } = ctx.access;
  const [tasks, references] = await Promise.all([
    prisma.task.findMany({
      where: { projectId: project.id },
      take: 50,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.reference.findMany({
      where: { projectId: project.id },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const context = [
    `Project: ${project.title}`,
    project.description && `Description: ${project.description}`,
    project.githubUrl && `GitHub: ${project.githubUrl}`,
    tasks.length &&
      `Tasks:\n${tasks.map((t) => `- [${t.status}] (${t.priority}) ${t.title}`).join("\n")}`,
    project.docs && `Project docs (excerpt):\n${project.docs.slice(0, 4000)}`,
    references.length &&
      `Saved references:\n${references
        .map((r) => `## ${r.title} (${r.url})\n${r.content.slice(0, 1500)}`)
        .join("\n\n")}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  // Model follows the project owner's plan (AI_MODEL overrides).
  const model = resolveModel(
    getSubscriptionConfig(project.owner.subscription).chatModel
  );
  try {
    const stream = await streamChat(model, [
      {
        role: "system",
        content: `You are the ${siteConfig.name} project assistant helping ${user.name}. Be concise and practical; use markdown. Use this project context when relevant:\n\n${context}`,
      },
      ...body.data.messages,
    ]);
    return new Response(stream, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    console.error("[ai]", error);
    return jsonError(
      "The AI provider returned an error. Try again shortly.",
      502
    );
  }
}
