import { Metadata } from "next";
import { notFound } from "next/navigation";

import DocsEditor from "@/components/dashboad/project/docs-editor";
import { siteConfig } from "@/config/site";
import { can, getProjectAccess } from "@/lib/access";

export const metadata: Metadata = {
  title: "Documentation",
  description: `Access comprehensive documentation and guides for using ${siteConfig.name} effectively.`,
};

export default async function ProjectDocsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const access = await getProjectAccess((await params).projectId);
  if (!access) notFound();
  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4 md:p-6">
      <div>
        <h1 className="page-title">Documentation</h1>
        <p className="text-muted-foreground text-sm">
          A shared markdown space for setup notes, architecture and decisions.
          The AI assistant reads it too.
        </p>
      </div>
      <DocsEditor
        projectId={access.project.id}
        initial={access.project.docs ?? ""}
        canEdit={can.edit(access.role)}
      />
    </div>
  );
}
