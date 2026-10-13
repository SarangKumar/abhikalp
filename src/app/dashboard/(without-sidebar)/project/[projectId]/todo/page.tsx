import { Metadata } from "next";
import React from "react";

import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "To-Do",
  description: `Manage your tasks and to-do lists efficiently within ${siteConfig.name}.`,
};

const ProjectTodoPage = () => {
  return <div>ProjectTodoPage</div>;
};

export default ProjectTodoPage;
