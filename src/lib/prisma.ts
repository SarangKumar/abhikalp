import { Prisma, PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const delegate = (model: string) => model[0].toLowerCase() + model.slice(1);

/** True when the client exposes every model of the generated schema. */
function isCurrent(client: PrismaClient | undefined): boolean {
  if (!client) return false;
  return Object.values(Prisma.ModelName).every(
    (model) => delegate(model) in client
  );
}

function create() {
  // A dev server survives `prisma generate`; a cached client from before the
  // regenerate lacks new models (e.g. `prisma.whiteboard` is undefined).
  // Drop it instead of reusing it.
  const cached = globalForPrisma.prisma;
  const current = isCurrent(cached);
  if (cached && !current) void cached.$disconnect().catch(() => {});
  const client = current && cached ? cached : new PrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
    warnIfStale(client);
  }
  return client;
}

/**
 * If the Prisma runtime itself was loaded before `prisma generate`, Node keeps
 * the old module in memory and only a restart helps: say so clearly.
 */
function warnIfStale(client: PrismaClient) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("node:fs") as typeof import("node:fs");
    const schema = fs.readFileSync("prisma/schema.prisma", "utf8");
    const missing = [...schema.matchAll(/^model\s+(\w+)/gm)]
      .map((m) => delegate(m[1]))
      .filter((name) => !(name in client));
    if (missing.length) {
      console.warn(
        `[prisma] Client is older than prisma/schema.prisma (missing: ${missing.join(", ")}). ` +
          "Run `npx prisma generate` and restart the dev server."
      );
    }
  } catch {
    // Schema not readable (e.g. bundled deployment): nothing to check.
  }
}

export const prisma = create();

export default prisma;
