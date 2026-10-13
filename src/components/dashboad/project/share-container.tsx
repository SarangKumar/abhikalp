"use client";

import type { Role } from "@prisma/client";
import { Check, Copy, LogOut, Trash2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import Avatar from "@/components/navbar/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";
import { ASSIGNABLE_ROLES, ROLE_DESCRIPTION, ROLE_LABEL } from "@/config/roles";
import { api } from "@/lib/fetcher";
import { notify } from "@/lib/notify";

type Person = { id: string; name: string; email: string; image: string | null };

export type MembersPanelProps = {
  projectId: string;
  viewerId: string;
  viewerRole: Role;
  owner: Person;
  members: { id: string; role: Role; user: Person }[];
  invites: { id: string; email: string; role: Role; expiresAt: string }[];
  maxInviteDays: number;
  maxMembers: number;
};

const EXPIRY_OPTIONS = [1, 3, 7, 14, 30, 60, 90];

export default function MembersPanel(props: MembersPanelProps) {
  const {
    projectId,
    viewerId,
    viewerRole,
    owner,
    members,
    invites,
    maxInviteDays,
    maxMembers,
  } = props;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("COLLABORATOR");
  const [days, setDays] = useState(Math.min(7, maxInviteDays));
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const canManage = viewerRole === "OWNER" || viewerRole === "ADMIN";
  const base = `/api/v1/projects/${projectId}`;
  const refresh = () => startTransition(() => router.refresh());

  async function run(
    key: string,
    fn: () => Promise<unknown>,
    success?: string
  ) {
    setBusy(key);
    try {
      await fn();
      if (success) notify.success(success);
      refresh();
    } catch (error) {
      notify.error("Something went wrong", (error as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setBusy("invite");
    try {
      const res = await api<{ url: string }>(`${base}/invites`, {
        method: "POST",
        body: { email, role, expiresInDays: days },
      });
      setLink(res.url);
      setCopied(false);
      setEmail("");
      notify.success("Invite created", "Share the link with your teammate.");
      refresh();
    } catch (error) {
      notify.error("Could not invite", (error as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const canEditMember = (memberRole: Role) =>
    viewerRole === "OWNER" ||
    (viewerRole === "ADMIN" && memberRole !== "ADMIN");

  return (
    <Card id="share" className="scroll-mt-16">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Collaborators
          <Badge variant="secondary">
            {members.length + 1} / {maxMembers + 1}
          </Badge>
          {pending && <Spinner className="size-3" />}
        </CardTitle>
        <CardDescription>
          Invite teammates by email and choose what they can do. Invites are
          tied to the email address and expire automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {canManage && (
          <form
            onSubmit={invite}
            className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto] md:items-end"
          >
            <div className="space-y-1.5">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                required
                placeholder="teammate@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invite-role">Role</Label>
              <NativeSelect
                id="invite-role"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                {ASSIGNABLE_ROLES.filter(
                  (r) => viewerRole === "OWNER" || r !== "ADMIN"
                ).map((r) => (
                  <NativeSelectOption key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invite-expiry">Expires in</Label>
              <NativeSelect
                id="invite-expiry"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
              >
                {EXPIRY_OPTIONS.filter((d) => d <= maxInviteDays).map((d) => (
                  <NativeSelectOption key={d} value={d}>
                    {d} {d === 1 ? "day" : "days"}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
            <Button type="submit" disabled={busy === "invite"}>
              {busy === "invite" ? <Spinner /> : <UserPlus />}
              Invite
            </Button>
            <p className="text-muted-foreground text-xs md:col-span-4">
              {ROLE_DESCRIPTION[role]}.
            </p>
          </form>
        )}

        {link && (
          <div className="bg-muted/40 flex items-center gap-2 rounded-lg border p-2">
            <code className="flex-1 truncate text-xs">{link}</code>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await navigator.clipboard.writeText(link);
                setCopied(true);
              }}
            >
              {copied ? <Check /> : <Copy />}
              {copied ? "Copied" : "Copy link"}
            </Button>
          </div>
        )}

        <ul className="divide-y rounded-lg border">
          <MemberRow person={owner} right={<Badge>{ROLE_LABEL.OWNER}</Badge>} />
          {members.map((m) => (
            <MemberRow
              key={m.id}
              person={m.user}
              right={
                <div className="flex items-center gap-2">
                  {canEditMember(m.role) && m.user.id !== viewerId ? (
                    <NativeSelect
                      aria-label={`Role for ${m.user.name}`}
                      className="h-8 w-36 text-xs"
                      value={m.role}
                      disabled={busy === m.id}
                      onChange={(e) =>
                        run(
                          m.id,
                          () =>
                            api(`${base}/members`, {
                              method: "PATCH",
                              body: { memberId: m.id, role: e.target.value },
                            }),
                          "Role updated"
                        )
                      }
                    >
                      {ASSIGNABLE_ROLES.filter(
                        (r) => viewerRole === "OWNER" || r !== "ADMIN"
                      ).map((r) => (
                        <NativeSelectOption key={r} value={r}>
                          {ROLE_LABEL[r]}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  ) : (
                    <Badge variant="secondary">{ROLE_LABEL[m.role]}</Badge>
                  )}
                  {(canEditMember(m.role) || m.user.id === viewerId) && (
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label={
                        m.user.id === viewerId
                          ? "Leave project"
                          : `Remove ${m.user.name}`
                      }
                      disabled={busy === m.id}
                      onClick={() =>
                        run(
                          m.id,
                          async () => {
                            await api(`${base}/members?memberId=${m.id}`, {
                              method: "DELETE",
                            });
                            if (m.user.id === viewerId)
                              router.push("/dashboard");
                          },
                          m.user.id === viewerId
                            ? "You left the project"
                            : "Member removed"
                        )
                      }
                    >
                      {m.user.id === viewerId ? <LogOut /> : <Trash2 />}
                    </Button>
                  )}
                </div>
              }
            />
          ))}
        </ul>

        {canManage && invites.length > 0 && (
          <div className="space-y-2">
            <h3 className="meta">Pending invites</h3>
            <ul className="divide-y rounded-lg border">
              {invites.map((inv) => (
                <li
                  key={inv.id}
                  className="flex items-center justify-between gap-2 px-3 py-2 text-xs"
                >
                  <span className="truncate">{inv.email}</span>
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Badge variant="outline">{ROLE_LABEL[inv.role]}</Badge>
                    expires {new Date(inv.expiresAt).toLocaleDateString()}
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      aria-label={`Revoke invite for ${inv.email}`}
                      disabled={busy === inv.id}
                      onClick={() =>
                        run(
                          inv.id,
                          () =>
                            api(`${base}/invites?inviteId=${inv.id}`, {
                              method: "DELETE",
                            }),
                          "Invite revoked"
                        )
                      }
                    >
                      <Trash2 />
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MemberRow({
  person,
  right,
}: {
  person: Person;
  right: React.ReactNode;
}) {
  return (
    <li className="flex items-center justify-between gap-3 px-3 py-2">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={person.name} image={person.image ?? ""} size="base" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{person.name}</p>
          <p className="text-muted-foreground truncate text-xs">
            {person.email}
          </p>
        </div>
      </div>
      {right}
    </li>
  );
}
