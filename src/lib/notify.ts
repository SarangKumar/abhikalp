"use client";

import { toast } from "@/components/ui/toast";

/** Thin wrapper over the Vinyaas toast so call sites stay short. */
export const notify = {
  success: (title: string, description?: string) =>
    toast.add({ title, description, type: "success" }),
  error: (title: string, description?: string) =>
    toast.add({ title, description, type: "error" }),
  info: (title: string, description?: string) =>
    toast.add({ title, description, type: "info" }),
};
