import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MilestoneList } from "@/components/dashboad/project/planning/milestone-list";
import { PageHeader } from "@/components/dashboad/project/planning/page-header";
import { can, getProjectAccess } from "@/lib/access";
import { loadMilestones } from "@/lib/planning-data";

export const metadata: Metadata = { title: "Milestones" };

export default async function MilestonesPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const access = await getProjectAccess((await params).projectId);
  if (!access) notFound();
  const milestones = await loadMilestones(access.project.id);
  return (
    <div className="space-y-4 p-4 md:p-6">
      <PageHeader
        title="Milestones"
        description="Checkpoints with due dates; progress comes from their linked tasks."
      />
      <MilestoneList
        projectId={access.project.id}
        milestones={milestones}
        canEdit={can.edit(access.role)}
      />
    </div>
  );
}
