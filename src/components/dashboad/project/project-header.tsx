import type { Project, Role } from "@prisma/client";
import { ChevronLeft, LockKeyhole } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { ROLE_LABEL } from "@/config/roles";

const ProjectHeader = ({
  project: { title, isPrivate },
  role,
}: {
  project: Project;
  role: Role;
}) => (
  <header className="bg-background/80 text-muted-foreground sticky top-0 z-30 flex h-12 items-center gap-x-2 border-b px-4 py-4 text-xs backdrop-blur md:px-6">
    <Link
      href="/dashboard"
      className="hover:bg-secondary flex size-7 items-center justify-center rounded-md"
    >
      <span className="sr-only">Go to Dashboard</span>
      <ChevronLeft size={18} />
    </Link>
    <span className="text-foreground flex items-center gap-x-2 font-medium">
      {title}
      {isPrivate && (
        <LockKeyhole className="text-muted-foreground stroke-[1.8]" size={14} />
      )}
    </span>
    {role !== "OWNER" && (
      <Badge variant="secondary" className="ml-1">
        {ROLE_LABEL[role]}
      </Badge>
    )}
  </header>
);

export default ProjectHeader;
