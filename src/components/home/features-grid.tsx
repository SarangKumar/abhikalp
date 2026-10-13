import {
  FileText,
  Globe,
  KanbanSquare,
  Package,
  ShieldCheck,
  Users,
} from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: Users,
    title: "Collaborators & roles",
    text: "Invite teammates by email as editors or viewers. Private projects stay private.",
  },
  {
    icon: KanbanSquare,
    title: "Drag-and-drop kanban",
    text: "Move tasks between To do, In progress and Done, reorder by priority, with keyboard support.",
  },
  {
    icon: FileText,
    title: "Project docs",
    text: "Write markdown documentation next to the work it describes, versioned with your project.",
  },
  {
    icon: Globe,
    title: "Web scrape",
    text: "Pull titles, metadata and links from any page straight into your project research.",
  },
  {
    icon: Package,
    title: "Package finder",
    text: "Search npm packages, compare downloads and versions without leaving the dashboard.",
  },
  {
    icon: ShieldCheck,
    title: "Secure sign-in",
    text: "Email and password, Google or GitHub. Sessions are short-lived and verified on every request.",
  },
];

export function FeaturesGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {features.map(({ icon: Icon, title, text }) => (
        <Card
          key={title}
          className="hover:border-primary/40 group transition-colors"
        >
          <CardHeader className="gap-3">
            <span className="bg-primary/10 text-primary ring-primary/15 flex size-9 items-center justify-center rounded-lg ring-1 transition-transform group-hover:-translate-y-0.5">
              <Icon className="size-4" />
            </span>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="leading-relaxed">
              {text}
            </CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
