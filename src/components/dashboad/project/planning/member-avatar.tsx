import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/planning";
import { cn } from "@/lib/utils";

export type Member = { id: string; name: string | null; image: string | null };

export function MemberAvatar({
  member,
  className,
}: {
  member: Member;
  className?: string;
}) {
  return (
    <Avatar
      className={cn("size-5 text-[10px]", className)}
      title={member.name ?? undefined}
    >
      {member.image && <AvatarImage src={member.image} alt="" />}
      <AvatarFallback>{initials(member.name)}</AvatarFallback>
    </Avatar>
  );
}
