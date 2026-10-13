"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/fetcher";
import { notify } from "@/lib/notify";

export default function AcceptInviteButton({
  token,
  children = "Accept invite",
  ...props
}: ButtonProps & { token: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <Button
      {...props}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const { projectId } = await api<{ projectId: string }>(
            "/api/v1/invites/accept",
            {
              method: "POST",
              body: { token },
            }
          );
          notify.success("You joined the project");
          router.push(`/dashboard/project/${projectId}`);
          router.refresh();
        } catch (error) {
          notify.error("Could not accept invite", (error as Error).message);
          setBusy(false);
        }
      }}
    >
      {busy && <Spinner />}
      {children}
    </Button>
  );
}
