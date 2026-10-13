import { KeyRound } from "lucide-react";
import { Metadata } from "next";
import { notFound } from "next/navigation";

import AiChat from "@/components/dashboad/project/ai-chat-loader";
import {
  Empty,
  EmptyDescription,
  EmptyIcon,
  EmptyTitle,
} from "@/components/ui/empty-state";
import { getSubscriptionConfig } from "@/config/subscription";
import { siteConfig } from "@/config/site";
import { getProjectAccess } from "@/lib/access";
import { isAiConfigured, resolveModel } from "@/lib/ai";

export const metadata: Metadata = {
  title: "AI Assistance",
  description: `Get help with your projects using AI assistance and enhance your productivity in ${siteConfig.name}.`,
};

export default async function AiAssistancePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const access = await getProjectAccess((await params).projectId);
  if (!access) notFound();

  if (!isAiConfigured()) {
    return (
      <Empty className="m-4 rounded-xl border border-dashed py-20 md:m-6">
        <EmptyIcon>
          <KeyRound />
        </EmptyIcon>
        <EmptyTitle>AI assistant is not configured</EmptyTitle>
        <EmptyDescription>
          Add <code>OPENAI_API_KEY</code> to your environment (see{" "}
          <code>.env.example</code>) and restart the server to chat with an
          assistant that knows this project&apos;s tasks, docs and references.
        </EmptyDescription>
      </Empty>
    );
  }

  return (
    <AiChat
      projectId={access.project.id}
      userName={access.user.name}
      userImage={access.user.image ?? ""}
      model={resolveModel(
        getSubscriptionConfig(access.project.owner.subscription).chatModel
      )}
    />
  );
}
