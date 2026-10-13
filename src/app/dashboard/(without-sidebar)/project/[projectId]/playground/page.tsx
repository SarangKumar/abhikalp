import { Metadata } from "next";
import { notFound } from "next/navigation";

import Playground, {
  type PlaygroundScene,
} from "@/components/dashboad/project/playground/playground";
import { can, getProjectAccess } from "@/lib/access";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Playground" };

export default async function PlaygroundPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const access = await getProjectAccess((await params).projectId);
  if (!access) notFound();
  const board = await prisma.whiteboard.findUnique({
    where: { projectId: access.project.id },
  });

  return (
    <Playground
      projectId={access.project.id}
      canEdit={can.edit(access.role)}
      initialScene={(board?.scene as PlaygroundScene | null) ?? null}
      savedAt={board?.updatedAt.toISOString() ?? null}
    />
  );
}
