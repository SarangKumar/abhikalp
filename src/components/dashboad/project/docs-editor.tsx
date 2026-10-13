"use client";

import { Save } from "lucide-react";
import { useState } from "react";

import MarkdownRender from "@/components/dashboad/project/task/markdown-render";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/fetcher";
import { notify } from "@/lib/notify";

const TEMPLATE = `# Overview

What this project is and who it is for.

## Getting started

1. Clone the repository
2. Install dependencies
3. Run the dev server

## Architecture

- Frontend:
- Backend:
- Data:

## Decisions

| Date | Decision | Why |
| ---- | -------- | --- |
|      |          |     |
`;

export default function DocsEditor({
  projectId,
  initial,
  canEdit,
}: {
  projectId: string;
  initial: string;
  canEdit: boolean;
}) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [saving, setSaving] = useState(false);
  const dirty = value !== saved;

  async function save() {
    setSaving(true);
    try {
      await api(`/api/v1/projects/${projectId}/docs`, {
        method: "PUT",
        body: { docs: value },
      });
      setSaved(value);
      notify.success("Documentation saved");
    } catch (error) {
      notify.error("Could not save", (error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (!canEdit) {
    return saved ? (
      <MarkdownRender>{saved}</MarkdownRender>
    ) : (
      <p className="text-muted-foreground">
        No documentation has been written yet.
      </p>
    );
  }

  return (
    <Tabs defaultValue={initial ? "preview" : "write"} className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <TabsList>
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          {!value && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setValue(TEMPLATE)}
            >
              Use template
            </Button>
          )}
          <span className="text-muted-foreground text-xs">
            {dirty ? "Unsaved changes" : "All changes saved"}
          </span>
          <Button size="sm" onClick={save} disabled={!dirty || saving}>
            {saving ? <Spinner /> : <Save />}
            Save
          </Button>
        </div>
      </div>
      <TabsContent value="write">
        <Textarea
          aria-label="Documentation (markdown)"
          className="min-h-[60dvh] font-mono text-xs"
          placeholder="Write your project documentation in markdown…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "s") {
              e.preventDefault();
              if (dirty) save();
            }
          }}
        />
      </TabsContent>
      <TabsContent
        value="preview"
        className="min-h-[60dvh] rounded-lg border p-4"
      >
        {value ? (
          <MarkdownRender>{value}</MarkdownRender>
        ) : (
          <p className="text-muted-foreground">Nothing to preview yet.</p>
        )}
      </TabsContent>
    </Tabs>
  );
}
