import React from "react";

import { cn } from "@/lib/utils";

export function Table({
  className,
  ref,
  ...props
}: React.ComponentProps<"table">) {
  return (
    <div className="w-full min-w-0 overflow-x-auto">
      <table
        ref={ref}
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

export function TableHeader({
  className,
  ...props
}: React.ComponentProps<"thead">) {
  return (
    <thead className={cn("border-border border-b", className)} {...props} />
  );
}

export function TableBody({
  className,
  ...props
}: React.ComponentProps<"tbody">) {
  return <tbody className={cn(className)} {...props} />;
}

export function TableFooter({
  className,
  ...props
}: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      className={cn("border-border bg-muted border-t font-medium", className)}
      {...props}
    />
  );
}

export function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      className={cn("border-border/50 hover:bg-accent border-b", className)}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      className={cn(
        "text-muted-foreground h-10 px-3 text-left align-middle font-medium",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return <td className={cn("px-3 py-2 align-middle", className)} {...props} />;
}

export function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      className={cn("text-muted-foreground mt-3 text-sm", className)}
      {...props}
    />
  );
}
