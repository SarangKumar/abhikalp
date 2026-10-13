import BoringAvatar from "boring-avatars";

import {
  Avatar as UiAvatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";

const px = { sm: 24, base: 32, lg: 48 } as const;
const box = {
  sm: "size-6 text-[10px]",
  base: "size-8 text-xs",
  lg: "size-12 text-base",
} as const;

// Purple-family palette for generated avatars (matches the brand).
const palette = ["#7c3aed", "#a855f7", "#c084fc", "#6d28d9", "#e879f9"];

const Avatar = ({
  image,
  name,
  size,
  className,
}: {
  image: string;
  name: string;
  size: "base" | "sm" | "lg";
  className?: string;
}) => {
  return (
    <UiAvatar className={cn("relative rounded-full", box[size], className)}>
      {image ? <AvatarImage src={image} alt={name} /> : null}
      <AvatarFallback className="relative overflow-hidden">
        <BoringAvatar
          size={px[size]}
          name={name || "Guest"}
          colors={palette}
          className="absolute inset-0"
        />
        <span className="relative font-medium text-white">
          {getInitials(name || "Guest")}
        </span>
      </AvatarFallback>
    </UiAvatar>
  );
};

export default Avatar;
