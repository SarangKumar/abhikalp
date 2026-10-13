import { Metadata } from "next";

import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "AI Assistance",
  description: `Get help with your projects using AI assistance and enhance your productivity in ${siteConfig.name}.`,
};

// TODO(ai-assistant): per-project chat; model comes from getSubscriptionConfig(tier).chatModel.
export default async function AiAssistancePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return (
    <div className="text-muted-foreground p-6">
      AI Assistance is coming soon for project {projectId}.
    </div>
  );
}
