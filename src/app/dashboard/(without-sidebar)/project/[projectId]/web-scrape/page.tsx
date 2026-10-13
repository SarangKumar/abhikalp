import { Metadata } from "next";
import { notFound } from "next/navigation";

import ReferenceManager from "@/components/dashboad/project/reference-manager";
import { siteConfig } from "@/config/site";
import { can, getProjectAccess } from "@/lib/access";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Web Scrape",
  description: `Save reference material from the web into your ${siteConfig.name} project.`,
};

export default async function WebScrapePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const access = await getProjectAccess((await params).projectId);
  if (!access) notFound();
  const references = await prisma.reference.findMany({
    where: { projectId: access.project.id },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="space-y-4 p-4 md:p-6">
      <div>
        <h1 className="page-title">Reference Integration</h1>
        <p className="text-muted-foreground text-sm">
          Scrape documentation, articles and specs into clean text your team
          (and the AI assistant) can use.
        </p>
      </div>
      <ReferenceManager
        projectId={access.project.id}
        canEdit={can.edit(access.role)}
        references={references.map((r) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
