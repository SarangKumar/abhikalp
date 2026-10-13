import { projectSidebarLinks } from "@/constants";
import React from "react";
import ProjectNavLinks from "./project-nav-links";
import Logo from "@/components/logo";
import SidebarStatus from "../sidebar/sidebar-status";
import { cn } from "@/lib/utils";

const ProjectSidebar = ({
  projectId,
  disableLinks = false,
  className,
}: {
  projectId: string;
  disableLinks?: boolean;
  className?: string;
}) => {
  return (
    <aside
      className={cn(
        "bg-background sticky top-0 flex h-dvh w-14 flex-col justify-between overflow-y-hidden border-r p-2 transition-all hover:w-56",
        className
      )}
    >
      <div>
        <Logo className="size-10" />
        {projectSidebarLinks.map((sidebartheme) => (
          <menu
            key={sidebartheme.name}
            className="flex flex-col gap-y-1 border-b py-2"
          >
            {sidebartheme.links.map((link) => (
              <ProjectNavLinks
                disableLinks={disableLinks}
                key={link.title}
                href={link.href}
                projectId={projectId}
                title={link.title}
                icon={link.icon}
              />
            ))}
          </menu>
        ))}
      </div>
      <SidebarStatus className="border-t-0 px-0.5 py-2" />
    </aside>
  );
};

export default ProjectSidebar;
