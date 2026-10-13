import type { Project, Role } from "@prisma/client";
import BoringAvatar from "boring-avatars";
import { ChevronRight, Globe, LockKeyhole } from "lucide-react";
import Link from "next/link";

import { GitHubIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ROLE_LABEL } from "@/config/roles";
import { cn, formatDate } from "@/lib/utils";

import MarkFavouriteButton from "./mark-favourite-button";

const palette = ["#7c3aed", "#a855f7", "#c084fc", "#6d28d9", "#e879f9"];

const ProjectCard = ({
  project,
  sharedRole,
}: {
  project: Project;
  sharedRole?: Role;
}) => {
  return (
    <li className="relative list-none">
      <Link
        className="absolute z-10 h-1/2 w-full"
        href={`/dashboard/project/${project.id}`}
      >
        <span className="sr-only">Open {project.title}</span>
      </Link>
      <div className="group bg-card hover:border-primary/40 relative flex h-[184px] cursor-pointer rounded-xl border p-5 pb-4 text-left transition duration-150 ease-in-out hover:shadow-[0_0_24px_var(--glow)]">
        <div className="flex w-full flex-col gap-y-2">
          <div className="flex items-center justify-between gap-x-4">
            <BoringAvatar size={32} name={project.title} colors={palette} />
            <div className="flex min-w-0 flex-1 flex-col">
              <p className="flex items-center gap-x-2 truncate font-medium">
                {project.title}
                {project.isPrivate && (
                  <LockKeyhole
                    size={12}
                    className="text-muted-foreground stroke-[2.5]"
                  />
                )}
              </p>
              <p className="text-muted-foreground meta">
                {project.isPrivate ? "Private" : "Public"} project
              </p>
            </div>
            <ChevronRight
              size={14}
              className="text-muted-foreground transition-transform group-hover:translate-x-1"
            />
          </div>

          <div className="flex-1">
            <span className="text-muted-foreground line-clamp-4 text-xs">
              {project.description || "No description"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-medium">
              {formatDate(project.createdAt)}
            </span>
            <div className="flex items-center gap-x-2">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "icon-sm" }),
                    "z-20"
                  )}
                >
                  <span className="sr-only">Github</span>
                  <GitHubIcon className="size-3.5" />
                </a>
              )}
              {project.deployedUrl && (
                <a
                  href={project.deployedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "icon-sm" }),
                    "z-20"
                  )}
                >
                  <span className="sr-only">Deployed Url</span>
                  <Globe className="size-3.5" />
                </a>
              )}
              {sharedRole ? (
                <Badge variant="secondary">{ROLE_LABEL[sharedRole]}</Badge>
              ) : (
                <MarkFavouriteButton
                  projectId={project.id}
                  isFavourite={project.isFavourite}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

export default ProjectCard;
