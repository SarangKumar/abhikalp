import { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/components/footer";
import Navbar from "@/components/navbar/navbar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROLE_DESCRIPTION, ROLE_LABEL } from "@/config/roles";
import { siteConfig } from "@/config/site";
import { subscriptions } from "@/config/subscription";

const description = `Explore ${siteConfig.name}'s documentation to learn about features, API references, and how-tos. Start using ${siteConfig.name} effectively.`;

export const metadata: Metadata = {
  title: {
    template: `%s | Documentation | ${siteConfig.name}`,
    default: `Documentation | ${siteConfig.name}`,
  },
  description,
  openGraph: {
    title: `Documentation | ${siteConfig.name}`,
    description,
    url: `${siteConfig.url}/docs`,
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Documentation | ${siteConfig.name}`,
    description,
  },
  alternates: { canonical: `${siteConfig.url}/docs` },
};

const SECTIONS = [
  { id: "guides", title: "Getting started" },
  { id: "projects", title: "Projects" },
  { id: "tasks", title: "Tasks" },
  { id: "collaboration", title: "Collaboration & roles" },
  { id: "documentation", title: "Project docs" },
  { id: "references", title: "Reference integration" },
  { id: "ai", title: "AI assistance" },
  { id: "packages", title: "Package finder" },
  { id: "plans", title: "Plans & limits" },
  { id: "api", title: "API reference" },
];

const API = [
  ["POST", "/api/v1/auth/sign-up", "Create an email/password account"],
  ["POST", "/api/v1/project/create", "Create a project (plan limit enforced)"],
  ["POST", "/api/v1/project/update", "Update project details (owner)"],
  ["POST", "/api/v1/project/favourite", "Toggle favourite (owner)"],
  [
    "POST · PATCH · DELETE",
    "/api/v1/projects/:id/tasks",
    "Create, update, delete tasks (editors)",
  ],
  ["PUT", "/api/v1/projects/:id/docs", "Save project documentation (editors)"],
  [
    "POST · DELETE",
    "/api/v1/projects/:id/references",
    "Scrape & save / remove a reference (editors)",
  ],
  [
    "POST · DELETE",
    "/api/v1/projects/:id/invites",
    "Invite by email / revoke (owner, admin)",
  ],
  [
    "PATCH · DELETE",
    "/api/v1/projects/:id/members",
    "Change role / remove or leave",
  ],
  ["POST", "/api/v1/invites/accept", "Accept an invite token"],
  [
    "POST",
    "/api/v1/projects/:id/ai",
    "Chat with the project assistant (streams text)",
  ],
  ["GET", "/api/v1/packages?q=", "Search npm packages"],
  ["POST", "/api/v1/billing/checkout", "Start a subscription checkout"],
  ["POST", "/api/v1/billing/portal", "Open the billing portal"],
];

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-3">
      <h2 className="section-title text-xl">{title}</h2>
      <div className="text-muted-foreground space-y-3 text-sm leading-relaxed">
        {children}
      </div>
    </section>
  );
}

const DocumentationPage = () => {
  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-352 px-6 py-12 md:py-16">
        <header className="mesh mb-12 rounded-3xl px-6 py-10 text-center">
          <h1 className="display text-3xl md:text-4xl">Documentation</h1>
          <p className="text-muted-foreground mx-auto mt-2 max-w-2xl text-balance">
            Everything you need to plan, build and ship with {siteConfig.name}.
          </p>
        </header>

        <div className="grid gap-10 lg:grid-cols-[14rem_1fr]">
          <nav aria-label="Documentation" className="hidden lg:block">
            <ul className="sticky top-24 space-y-1 text-sm">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-muted-foreground hover:text-foreground block rounded-md px-2 py-1 transition-colors"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <article className="max-w-3xl space-y-12">
            <Section id="guides" title="Getting started">
              <ol className="list-decimal space-y-1 pl-5">
                <li>
                  <Link
                    href="/auth/sign-up"
                    className="text-primary hover:underline"
                  >
                    Create an account
                  </Link>{" "}
                  with email and password, or continue with Google or GitHub.
                </li>
                <li>Open the dashboard and create your first project.</li>
                <li>
                  Add tasks, write docs, save references and invite your team.
                </li>
              </ol>
              <Link
                href="/dashboard"
                className={buttonVariants({ size: "sm" })}
              >
                Go to dashboard
              </Link>
            </Section>

            <Section id="projects" title="Projects">
              <p>
                A project has a title, description, optional GitHub and live
                URLs, and a private/public flag. Mark favourites from the
                project card. The owner can edit details from <em>Settings</em>.
                How many projects you can own depends on your plan.
              </p>
            </Section>

            <Section id="tasks" title="Tasks">
              <p>
                The <em>Todo</em> board has three columns (To do, In progress,
                Done). Each task has a markdown description, a priority (high,
                medium, low), an optional estimate in hours and a due date.
                Overdue tasks are highlighted. Use the card menu to move, edit
                or delete a task, and filter by priority or text.
              </p>
            </Section>

            <Section id="collaboration" title="Collaboration & roles">
              <p>
                Invite teammates by email from <em>Settings → Collaborators</em>
                . Each invite creates a private link that only works for the
                invited email address and expires after the period you choose.
                Invitees also see the invite on their dashboard.
              </p>
              <ul className="space-y-2">
                {(["OWNER", "ADMIN", "COLLABORATOR", "VIEWER"] as const).map(
                  (role) => (
                    <li key={role} className="flex items-start gap-2">
                      <Badge
                        variant={role === "OWNER" ? "default" : "secondary"}
                        className="mt-0.5 w-24 justify-center"
                      >
                        {ROLE_LABEL[role]}
                      </Badge>
                      <span>{ROLE_DESCRIPTION[role]}.</span>
                    </li>
                  )
                )}
              </ul>
            </Section>

            <Section id="documentation" title="Project docs">
              <p>
                Each project has a shared markdown page with live preview
                (tables and task lists supported). Press
                <kbd className="bg-muted mx-1 rounded border px-1 text-xs">
                  ⌘/Ctrl S
                </kbd>{" "}
                to save. Start from the built-in template if the page is empty.
              </p>
            </Section>

            <Section id="references" title="Reference integration">
              <p>
                Paste the URL of an article, API reference or spec on the{" "}
                <em>Web Scrape</em> page. {siteConfig.name} fetches the page,
                strips navigation and scripts, and stores the readable text with
                the project. Only public http(s) pages are allowed.
              </p>
            </Section>

            <Section id="ai" title="AI assistance">
              <p>
                The assistant answers questions with your project&apos;s
                description, tasks, docs and latest references as context.
                Conversations are stored in your browser only. The model depends
                on the project owner&apos;s plan. Self-hosters enable it by
                setting <code>OPENAI_API_KEY</code>.
              </p>
            </Section>

            <Section id="packages" title="Package finder">
              <p>
                Describe what you need in plain words and compare npm packages
                by weekly downloads, last publish date and keywords. Copy the
                install command with one click.
              </p>
            </Section>

            <Section id="plans" title="Plans & limits">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan</TableHead>
                    <TableHead>Projects</TableHead>
                    <TableHead>Collaborators / project</TableHead>
                    <TableHead>Invite link expiry</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.values(subscriptions).map((s) => (
                    <TableRow key={s.tier}>
                      <TableCell className="font-medium">
                        {s.tier[0] + s.tier.slice(1).toLowerCase()}
                      </TableCell>
                      <TableCell>{s.maxProjects}</TableCell>
                      <TableCell>{s.maxMembers}</TableCell>
                      <TableCell>up to {s.maxInviteDays} days</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Link
                href="/pricing"
                className="text-primary text-sm hover:underline"
              >
                Compare plans →
              </Link>
            </Section>

            <Section id="api" title="API reference">
              <p>
                All endpoints use the signed-in session cookie and return JSON
                with a <code>message</code> on errors.
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Method</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Purpose</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {API.map(([method, path, purpose]) => (
                    <TableRow key={path}>
                      <TableCell className="font-mono text-xs whitespace-nowrap">
                        {method}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {path}
                      </TableCell>
                      <TableCell className="text-xs">{purpose}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Section>
          </article>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DocumentationPage;
