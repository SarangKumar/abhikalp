import React from "react";
import { Project } from "@prisma/client";
import Link from "next/link";
import { ChevronLeft, LockKeyhole } from "lucide-react";

const ProjectHeader = ({
  project: { title, isPrivate },
}: {
  project: Project;
}) => {
  return (
    <header className="bg-background text-muted-foreground sticky top-0 z-30 flex h-12 items-center gap-x-2 border-b px-4 py-4 text-xs md:px-6">
      <Link
        href="/dashboard"
        className="bg-secondary/40 flex size-7 items-center justify-center rounded"
      >
        <span className="sr-only">Go to Dashboard</span>
        <ChevronLeft size={18} />
      </Link>
      <span className="flex items-center gap-x-2 font-medium">
        {title}
        {isPrivate && (
          <LockKeyhole
            className="text-muted-foreground stroke-[1.8]"
            size={14}
          />
        )}
      </span>
    </header>
  );
};

export default ProjectHeader;
