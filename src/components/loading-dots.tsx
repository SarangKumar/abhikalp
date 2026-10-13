import { cn } from "@/lib/utils";

const sizes = { xs: "size-0.5", sm: "size-1", base: "size-1.5", lg: "size-2" };

const LoadingDots = ({
  variant = "base",
}: {
  variant?: keyof typeof sizes;
}) => (
  <span
    className="flex items-center justify-center gap-0.5"
    aria-label="Loading"
  >
    {["", "delay-180", "delay-360"].map((delay, i) => (
      <span
        key={i}
        className={cn(
          "animate-fade rounded-full bg-current",
          sizes[variant],
          delay
        )}
      />
    ))}
  </span>
);

export default LoadingDots;
