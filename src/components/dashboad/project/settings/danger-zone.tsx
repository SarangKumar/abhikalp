"use client";

import type { Project } from "@prisma/client";

import { ProjectForm } from "../project-form";

const DangerZone = ({ project }: { project: Project }) => {
  return (
    <section className="border-b p-4 md:p-6">
      <h3 className="section-title mx-auto mb-4 max-w-3xl text-lg">
        Danger Zone
      </h3>
      <ProjectForm
        endpoint="/api/v1/project/update"
        extraBody={{ projectId: project.id }}
        submitLabel="Edit Project Details"
        onSuccess="refresh"
        defaultValues={{
          title: project.title,
          description: project.description || "",
          isPrivate: project.isPrivate,
          isFavourite: project.isFavourite,
          githubUrl: project.githubUrl || "",
          deployedUrl: project.deployedUrl || "",
        }}
      />
    </section>
  );
};

export default DangerZone;
