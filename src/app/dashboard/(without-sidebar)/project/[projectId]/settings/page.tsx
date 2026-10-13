import { Metadata } from "next";
import { notFound } from "next/navigation";

import { getUserBySession } from "@/app/api/utils";
import DangerZone from "@/components/dashboad/project/settings/danger-zone";
import { siteConfig } from "@/config/site";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Settings",
  description: `Manage your account settings, preferences, and configurations in ${siteConfig.name}.`,
};

const SettingsPage = async ({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) => {
  const { projectId } = await params;
  const user = await getUserBySession();
  if (!user) return null;
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: user.id },
  });
  if (!project) notFound();

  return (
    <div>
      <h2 className="page-title border-b p-4 md:p-6">
        Settings · {project.title}
      </h2>
      <DangerZone project={project} />
    </div>
  );
};

export default SettingsPage;
