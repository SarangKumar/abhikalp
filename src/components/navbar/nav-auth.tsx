import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/lib/auth";

import { AvatarHoverCard } from "./user-profile";

const NavAuth = async () => {
  const session = await auth();

  if (!session) {
    return (
      <Link
        href="/auth/sign-in"
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        Sign In
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-x-2">
      <AvatarHoverCard
        name={session.user?.name}
        email={session.user?.email}
        image={session.user?.image}
      />
    </div>
  );
};

export default NavAuth;
