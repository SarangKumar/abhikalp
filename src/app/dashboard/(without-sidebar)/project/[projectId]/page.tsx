import { Edit } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getUserBySession } from "@/app/api/utils";
import TaskStatusCard from "@/components/dashboad/project/task/task-status-card";
import Avatar from "@/components/navbar/avatar";
import { buttonVariants } from "@/components/ui/button";
import { ScoreRing } from "@/components/ui/score-ring";
import prisma from "@/lib/prisma";
import { cn, formatDate } from "@/lib/utils";

type Props = { params: Promise<{ projectId: string }> };

async function getProject(projectId: string) {
  const user = await getUserBySession();
  if (!user || !/^[a-f\d]{24}$/i.test(projectId)) return null;
  return prisma.project.findFirst({
    where: { id: projectId, ownerId: user.id },
    include: { tasks: true, owner: true },
  });
}

export async function generateMetadata({ params }: Props) {
  const { projectId } = await params;
  const project = await getProject(projectId);
  if (!project) return {};
  return { title: project.title, description: project.description || "" };
}

const ProjectPage = async ({ params }: Props) => {
  const { projectId } = await params;
  const project = await getProject(projectId);
  if (!project) notFound();

  const total = project.tasks.length;
  const count = (status: string) =>
    project.tasks.filter((t) => t.status === status).length;
  const rings = [
    { label: "Completed", value: count("COMPLETED") },
    { label: "In progress", value: count("IN_PROGRESS") },
    { label: "Pending", value: count("PENDING") },
  ];

  return (
    <div className="h-full space-y-4 p-4 text-sm md:p-6">
      <div className="project-bg mesh relative mb-8 flex h-60 w-full flex-col justify-between overflow-hidden rounded-xl border p-3 md:p-5">
        <h1 className="display from-foreground to-primary flex-1 bg-linear-to-r bg-clip-text text-xl text-transparent md:text-3xl">
          {project.title}
        </h1>
        <div className="flex items-end justify-between gap-x-2">
          <div className="flex items-center gap-x-3">
            {rings.map((ring) => (
              <div
                key={ring.label}
                className="flex flex-col items-center gap-1"
              >
                <ScoreRing
                  size="sm"
                  value={ring.value}
                  max={Math.max(total, 1)}
                  fromColor="var(--muted-foreground)"
                  toColor="var(--primary)"
                  label={`${ring.label}: ${ring.value} of ${total}`}
                />
                <span className="text-muted-foreground text-[10px]">
                  {ring.label}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-col text-right">
            <span className="text-muted-foreground text-[10px] italic md:text-xs">
              Created: {formatDate(project.createdAt)}
            </span>
            <span className="text-muted-foreground text-[10px] italic md:text-xs">
              Modified: {formatDate(project.updatedAt)}
            </span>
          </div>
        </div>
      </div>
      <div className="mb-4 flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <h1 className="page-title flex items-center">
          {project.title}
          <Link
            href={`/dashboard/project/${project.id}/settings`}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-sm" }),
              "ml-2"
            )}
          >
            <Edit className="text-muted-foreground size-4" />
            <span className="sr-only">Edit</span>
          </Link>
        </h1>
        <div className="flex items-center gap-x-4">
          {/* TODO(collaboration): show real collaborators once roles/share links exist. */}
          <Avatar
            name={project.owner.name}
            image={project.owner.image || ""}
            size="base"
            className="ring-background ring-2"
          />
          <Link
            href={`/dashboard/project/${project.id}/settings#share`}
            className={buttonVariants()}
          >
            Invite Collaborators
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <section className="xl:col-span-2">
          <p className="text-xs leading-relaxed sm:text-sm">
            {project.description}
          </p>
        </section>
        <section className="grid grid-cols-1 gap-4">
          <div className="flex items-center justify-between">
            <h2 className="section-title text-base">Tasks ({total})</h2>
            <Link
              className={buttonVariants({ variant: "link", size: "sm" })}
              href={`/dashboard/project/${project.id}/todo`}
            >
              View all
            </Link>
          </div>
          {project.tasks.slice(0, 4).map((task) => (
            <TaskStatusCard
              projectName={project.title}
              task={task}
              key={task.id}
            />
          ))}
          <Link
            href={`/dashboard/project/${project.id}/todo`}
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className: "border-dashed text-xs font-normal",
            })}
          >
            + Add a new Task
          </Link>
        </section>
      </div>
    </div>
  );
};

export default ProjectPage;
