import React from "react";

import { cn } from "@/lib/utils";

const Container = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <section
      className={cn(
        "relative mx-auto px-4 py-16 pb-8 md:px-8 md:py-24 lg:px-16 xl:px-20",
        className
      )}
    >
      {children}
    </section>
  );
};

export default Container;
