"use client";

import type { Project } from "@prisma/client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ProjectForm } from "../project-form";

/** Owner-only project details form. */
const DangerZone = ({ project }: { project: Project }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project details</CardTitle>
        <CardDescription>
          Name, description, visibility and links. Only the owner can change
          these.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ProjectForm
          className="mx-0 mb-0 max-w-none"
          endpoint="/api/v1/project/update"
          extraBody={{ projectId: project.id }}
          submitLabel="Save project details"
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
      </CardContent>
    </Card>
  );
};

export default DangerZone;
