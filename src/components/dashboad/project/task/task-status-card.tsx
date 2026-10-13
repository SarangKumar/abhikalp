import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn, formatDate } from "@/lib/utils";
import { Task, TaskStatus } from "@prisma/client";
import { Clock5 } from "lucide-react";
import React from "react";
import MarkdownRender from "./markdown-render";

function TaskStatusCard({
  task,
  projectName,
}: {
  task: Task;
  projectName: string;
}) {
  return (
    <div className="border-border hover:border-foreground/40 hover:bg-secondary/10 space-y-1 rounded-md border px-4 py-2 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs font-medium">
          Project: {projectName}
        </span>
        <TaskStatusText status={task.status} />
      </div>
      <Accordion
        collapsible
        className="group flex items-center justify-between"
      >
        <AccordionItem value="item-1" className="w-full border-0">
          <AccordionTrigger className="truncate border-0 pt-0 pb-1 text-left text-xs">
            {task.title}
          </AccordionTrigger>
          <AccordionContent>
            <MarkdownRender>{task.description || ""}</MarkdownRender>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-muted-foreground text-[10px]">
            Created: {formatDate(task.createdAt)}
          </span>
          {/* <span className="text-xs text-muted-foreground">
            Updated: {formatDate(task.updatedAt)}
          </span> */}
        </div>
        {task.estimatedTimeForCompletion && (
          <span className="text-muted-foreground flex items-center gap-x-1 text-[12px]">
            <Clock5 size={14} />
            {task.estimatedTimeForCompletion}{" "}
            {task.estimatedTimeForCompletion >= 1 ? "hr" : "hrs"}
          </span>
        )}
      </div>
    </div>
  );
}

export default TaskStatusCard;

export function TaskStatusText({ status }: { status: TaskStatus }) {
  const taskCorr = [
    { status: "PENDING", color: "bg-warning", text: "Pending" },
    { status: "IN_PROGRESS", color: "bg-info", text: "In Progress" },
    { status: "COMPLETED", color: "bg-success", text: "Completed" },
  ];
  const task = taskCorr.find((task) => task.status === status);
  if (!task) return null;

  return (
    <span className="flex items-center gap-x-2 rounded-full border px-2 py-[1px]">
      <span className={cn("size-2 rounded-full", task.color)}></span>
      <span className="text-[10px] font-semibold capitalize md:text-xs md:font-medium">
        {task.text}
      </span>
    </span>
  );
}
