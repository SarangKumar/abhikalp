"use client";

import { ProjectForm } from "./project-form";

export function CreateProject() {
  return (
    <ProjectForm
      endpoint="/api/v1/project/create"
      submitLabel="Create Project"
      onSuccess="dashboard"
      defaultValues={{
        title: "",
        description: "",
        isPrivate: true,
        isFavourite: false,
        githubUrl: "",
        deployedUrl: "",
      }}
    />
  );
}
