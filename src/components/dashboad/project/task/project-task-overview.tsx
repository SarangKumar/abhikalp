import type { Task, TaskPriority, TaskStatus } from "@prisma/client";
import { CalendarClock, Clock5, ListTodo, Plus } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyActions,
  EmptyDescription,
  EmptyIcon,
  EmptyTitle,
} from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

const GROUPS: { status: TaskStatus; label: string; dot: string }[] = [
  { status: "IN_PROGRESS", label: "In progress", dot: "bg-info" },
  { status: "PENDING", label: "Pending", dot: "bg-warning" },
  { status: "COMPLETED", label: "Completed", dot: "bg-success" },
];
const PRIORITY: Record<TaskPriority, string> = {
  HIGH: "border-destructive/30 bg-destructive/10 text-destructive",
  MEDIUM: "border-primary/30 bg-primary/10 text-primary",
  LOW: "border-border text-muted-foreground",
};
const PER_GROUP = 4;

/** Project home: tasks grouped by status with counts, priority and due dates. */
export default function ProjectTaskOverview({
  tasks,
  todoHref,
  canEdit,
}: {
  tasks: Task[];
  todoHref: string;
  canEdit: boolean;
}) {
  const now = new Date();
  return (
    <Card className="gap-0 p-0">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="text-base">Tasks</CardTitle>
        <CardDescription>
          {tasks.length} total ·{" "}
          {tasks.filter((t) => t.status === "COMPLETED").length} done
        </CardDescription>
        <CardAction className="flex items-center gap-1">
          {canEdit && (
            <Link
              href={`${todoHref}?new=1`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Plus className="size-4" /> New task
            </Link>
          )}
          <Link
            href={todoHref}
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            View board
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent className="p-0">
        {tasks.length === 0 ? (
          <Empty size="sm" className="py-12">
            <EmptyIcon>
              <ListTodo className="size-5" />
            </EmptyIcon>
            <EmptyTitle>No tasks yet</EmptyTitle>
            <EmptyDescription>
              Break the project into tasks and track them from Pending to
              Completed.
            </EmptyDescription>
            {canEdit && (
              <EmptyActions>
                <Link
                  href={`${todoHref}?new=1`}
                  className={buttonVariants({ size: "sm" })}
                >
                  <Plus className="size-4" /> Create the first task
                </Link>
              </EmptyActions>
            )}
          </Empty>
        ) : (
          GROUPS.map((group) => {
            const items = tasks.filter((t) => t.status === group.status);
            if (!items.length) return null;
            return (
              <section
                key={group.status}
                aria-label={group.label}
                className="border-b last:border-b-0"
              >
                <header className="bg-muted/40 flex items-center gap-2 px-5 py-2">
                  <span className={cn("size-2 rounded-full", group.dot)} />
                  <h3 className="text-xs font-medium tracking-wide uppercase">
                    {group.label}
                  </h3>
                  <Badge
                    variant="secondary"
                    className="h-5 min-w-5 justify-center px-1.5 text-[11px] tabular-nums"
                  >
                    {items.length}
                  </Badge>
                </header>
                <ul className="divide-y">
                  {items.slice(0, PER_GROUP).map((task) => {
                    const overdue =
                      task.dueDate &&
                      task.status !== "COMPLETED" &&
                      task.dueDate < now;
                    return (
                      <li key={task.id}>
                        <Link
                          href={todoHref}
                          className="hover:bg-accent/50 focus-visible:bg-accent/50 flex min-h-14 items-center gap-3 px-5 py-3 transition-colors outline-none"
                        >
                          <div className="min-w-0 flex-1">
                            <p
                              className={cn(
                                "truncate text-sm font-medium",
                                task.status === "COMPLETED" &&
                                  "text-muted-foreground line-through"
                              )}
                            >
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-muted-foreground mt-0.5 truncate text-xs">
                                {task.description}
                              </p>
                            )}
                          </div>
                          <div className="text-muted-foreground flex shrink-0 items-center gap-2 text-xs">
                            {task.estimatedTimeForCompletion ? (
                              <span className="hidden items-center gap-1 sm:flex">
                                <Clock5 className="size-3.5" />
                                {task.estimatedTimeForCompletion}h
                              </span>
                            ) : null}
                            {task.dueDate && (
                              <Badge
                                variant={overdue ? "destructive" : "outline"}
                                className="gap-1 font-normal"
                              >
                                <CalendarClock className="size-3.5" />
                                {task.dueDate.toLocaleDateString("en", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </Badge>
                            )}
                            <Badge
                              variant="outline"
                              className={cn(
                                "capitalize",
                                PRIORITY[task.priority]
                              )}
                            >
                              {task.priority.toLowerCase()}
                            </Badge>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                {items.length > PER_GROUP && (
                  <Link
                    href={todoHref}
                    className="text-muted-foreground hover:text-foreground block px-5 py-2 text-xs"
                  >
                    +{items.length - PER_GROUP} more {group.label.toLowerCase()}
                  </Link>
                )}
              </section>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
