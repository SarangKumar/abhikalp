import Link from "next/link";

import { getUserBySession } from "@/app/api/utils";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/ui/score-ring";
import { getSubscriptionConfig } from "@/config/subscription";
import { cn } from "@/lib/utils";

/** Project usage vs. plan limit, plus the current plan. */
const SidebarStatus = async ({ className }: { className?: string }) => {
  const user = await getUserBySession({ project: true });
  if (!user) return null;

  const projectCount = user.projects.length;
  const projectLimit = getSubscriptionConfig(user.subscription).maxProjects;

  return (
    <div
      className={cn(
        "@container relative flex items-center justify-start gap-x-2 text-sm",
        className
      )}
    >
      <ScoreRing
        size="xs"
        value={projectCount}
        max={projectLimit}
        fromColor="var(--success)"
        toColor="var(--destructive)"
        label={`${projectCount} of ${projectLimit} projects used`}
        className="shrink-0"
      />
      <div className="project-link hidden h-full min-w-0 flex-1 -translate-x-1 flex-col items-start opacity-0 transition-all duration-700 @min-[3rem]:flex @min-[3rem]:translate-x-0 @min-[3rem]:opacity-100">
        <span className="flex w-full items-center gap-1.5 truncate text-xs whitespace-nowrap md:text-sm">
          {user.name}
          <Link href="/dashboard/settings">
            <Badge
              variant={user.subscription === "FREE" ? "secondary" : "default"}
            >
              {user.subscription}
            </Badge>
          </Link>
        </span>
        <span className="text-muted-foreground line-clamp-1 truncate text-xs whitespace-nowrap">
          {user.email}
        </span>
      </div>
    </div>
  );
};

export default SidebarStatus;
