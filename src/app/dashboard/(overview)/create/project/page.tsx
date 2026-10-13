import { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/session";
import DashboardNavbar from "@/components/dashboad/dashboard-navbar";
import { CreateProject } from "@/components/dashboad/project/create-project";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { getSubscriptionConfig } from "@/config/subscription";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Create New Project",
  description: `Start a new project in ${siteConfig.name}. Set up your project details, define tasks, and begin your journey to streamlined project management and collaboration.`,
};

const CreateProjectPage = async () => {
  const user = await requireUser("/dashboard/create/project", {
    project: true,
  });

  const subscription = getSubscriptionConfig(user.subscription);
  const isProjectLimitReached =
    subscription.maxProjects <= user.projects.length;

  return (
    <div>
      <DashboardNavbar title="Create New Project" />
      <main className="flex-1 px-4 py-6 text-sm">
        {isProjectLimitReached ? (
          <div className="mx-auto max-w-3xl space-y-6">
            <h1 className="page-title">Project Limit Reached</h1>
            <Alert>
              You have reached the maximum number of projects allowed for your
              current subscription tier. To create more projects, please upgrade
              your subscription.
            </Alert>
            <Link href="/pricing" className={buttonVariants()}>
              Upgrade Subscription
            </Link>
          </div>
        ) : (
          <>
            <h1 className="page-title mx-auto mb-6 max-w-3xl">New Project</h1>
            <CreateProject />
          </>
        )}
      </main>
    </div>
  );
};

export default CreateProjectPage;
