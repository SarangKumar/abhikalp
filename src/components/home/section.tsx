import { cn } from "@/lib/utils";

export function Section({
  id,
  eyebrow,
  title,
  description,
  className,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("scroll-mt-20 py-16 md:py-24", className)}>
      <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
        {eyebrow && (
          <span className="chip mb-4">
            <span className="chip-dot" />
            {eyebrow}
          </span>
        )}
        <h2 className="display text-foreground text-3xl text-balance md:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="text-muted-foreground mt-3 text-sm text-balance md:text-base">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}
