"use client";

import type { Role } from "@prisma/client";

import Avatar from "@/components/navbar/avatar";
import { Tooltip } from "@/components/ui/tooltip";
import { ROLE_LABEL } from "@/config/roles";

// Client component: rendering a list of Tooltips directly from an async server
// component crashes Next 16 dev SSR ("Element type is invalid").
export default function MemberAvatars({
  people,
  max = 5,
}: {
  people: { id: string; name: string; image: string | null; role: Role }[];
  max?: number;
}) {
  return (
    <div className="flex -space-x-2">
      {people.slice(0, max).map((p) => (
        <Tooltip key={p.id} content={`${p.name} · ${ROLE_LABEL[p.role]}`}>
          <span className="inline-flex">
            <Avatar
              name={p.name}
              image={p.image || ""}
              size="base"
              className="ring-background ring-2"
            />
          </span>
        </Tooltip>
      ))}
      {people.length > max && (
        <span className="bg-secondary ring-background flex size-8 items-center justify-center rounded-full text-xs ring-2">
          +{people.length - max}
        </span>
      )}
    </div>
  );
}
