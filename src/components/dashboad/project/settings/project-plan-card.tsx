"use client";

import type { ProjectHealth, ProjectStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { DateField } from "@/components/date-field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/fetcher";
import { notify } from "@/lib/notify";
import { HEALTH_META, PROJECT_STATUS_LABEL } from "@/lib/planning";

export function ProjectPlanCard({
  projectId,
  initial,
  canEdit,
}: {
  projectId: string;
  initial: {
    status: ProjectStatus;
    health: ProjectHealth;
    startDate: string | null;
    targetDate: string | null;
  };
  canEdit: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initial.status);
  const [health, setHealth] = useState(initial.health);
  const [startDate, setStartDate] = useState<Date | null>(
    initial.startDate ? new Date(initial.startDate) : null
  );
  const [targetDate, setTargetDate] = useState<Date | null>(
    initial.targetDate ? new Date(initial.targetDate) : null
  );
  const [saving, setSaving] = useState(false);
  const invalid = !!startDate && !!targetDate && startDate > targetDate;

  async function save() {
    setSaving(true);
    try {
      await api(`/api/v1/projects/${projectId}/planning`, {
        method: "PATCH",
        body: {
          status,
          health,
          startDate: startDate?.toISOString() ?? null,
          targetDate: targetDate?.toISOString() ?? null,
        },
      });
      notify.success("Project plan saved");
      router.refresh();
    } catch (error) {
      notify.error("Could not save plan", (error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project plan</CardTitle>
        <CardDescription>
          Status, health and schedule shown on the overview.
          {!canEdit && " Only owners and admins can change these."}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select
            value={status}
            disabled={!canEdit}
            onValueChange={(v) => setStatus(v as ProjectStatus)}
          >
            <SelectTrigger aria-label="Project status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(PROJECT_STATUS_LABEL) as ProjectStatus[]).map(
                (s) => (
                  <SelectItem key={s} value={s}>
                    {PROJECT_STATUS_LABEL[s]}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Health</Label>
          <Select
            value={health}
            disabled={!canEdit}
            onValueChange={(v) => setHealth(v as ProjectHealth)}
          >
            <SelectTrigger aria-label="Project health">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(HEALTH_META) as ProjectHealth[]).map((h) => (
                <SelectItem key={h} value={h}>
                  {HEALTH_META[h].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="plan-start">Start date</Label>
          <DateField
            id="plan-start"
            placeholder="Not set"
            disabled={!canEdit}
            value={startDate}
            onChange={setStartDate}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="plan-target">Target date</Label>
          <DateField
            id="plan-target"
            placeholder="Not set"
            disabled={!canEdit}
            value={targetDate}
            disabledDates={startDate ? { before: startDate } : undefined}
            onChange={setTargetDate}
          />
        </div>
        {invalid && (
          <p className="text-destructive text-xs sm:col-span-2">
            The target date must be on or after the start date.
          </p>
        )}
      </CardContent>
      {canEdit && (
        <CardFooter className="justify-end">
          <Button onClick={() => void save()} disabled={saving || invalid}>
            {saving && <Spinner />}
            Save plan
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
