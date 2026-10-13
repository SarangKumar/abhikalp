import {
  BookOpen,
  Box,
  Brain,
  CalendarDays,
  ChartColumn,
  Code2,
  FilePlus2,
  Flag,
  FolderKanban,
  FolderPlus,
  GanttChart,
  Globe,
  History,
  House,
  LayoutList,
  PenTool,
  Settings,
} from "lucide-react";

import { features } from "@/config/features";

import type { NavSection } from "./app-sidebar";

export const dashboardNav: NavSection[] = [
  {
    name: "Projects",
    items: [
      {
        title: "My Projects",
        href: "/dashboard",
        icon: <FolderKanban />,
        exact: true,
      },
      {
        title: "Create New Project",
        href: "/dashboard/create/project",
        icon: <FolderPlus />,
      },
      { title: "Settings", href: "/dashboard/settings", icon: <Settings /> },
    ],
  },
  {
    name: "Documentation",
    items: [
      { title: "Guides", href: "/docs#guides", icon: <BookOpen /> },
      { title: "API Reference", href: "/docs#api", icon: <Code2 /> },
    ],
  },
];

export function projectNav(projectId: string): NavSection[] {
  const base = `/dashboard/project/${projectId}`;
  return [
    {
      name: "Project",
      items: [
        { title: "Home", href: base, icon: <House />, exact: true },
        { title: "Overview", href: `${base}/overview`, icon: <ChartColumn /> },
        { title: "Todo", href: `${base}/todo`, icon: <LayoutList /> },
        { title: "Docs", href: `${base}/documentation`, icon: <FilePlus2 /> },
        { title: "Playground", href: `${base}/playground`, icon: <PenTool /> },
      ],
    },
    {
      name: "Plan",
      items: [
        { title: "Milestones", href: `${base}/milestones`, icon: <Flag /> },
        { title: "Calendar", href: `${base}/calendar`, icon: <CalendarDays /> },
        { title: "Timeline", href: `${base}/timeline`, icon: <GanttChart /> },
        { title: "Activity", href: `${base}/activity`, icon: <History /> },
      ],
    },
    {
      name: "Tools",
      items: [
        { title: "Web Scrape", href: `${base}/web-scrape`, icon: <Globe /> },
        ...(features.aiAssistant
          ? [
              {
                title: "AI Assistance",
                href: `${base}/ai-assistance`,
                icon: <Brain />,
              },
            ]
          : []),
        { title: "Package Finder", href: `${base}/package`, icon: <Box /> },
      ],
    },
    {
      name: "Manage",
      items: [
        { title: "Settings", href: `${base}/settings`, icon: <Settings /> },
        {
          title: "All Projects",
          href: "/dashboard",
          icon: <FolderKanban />,
          exact: true,
        },
      ],
    },
  ];
}
