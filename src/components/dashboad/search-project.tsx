"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";

const SearchProject = ({ placeholder }: { placeholder: string }) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams);
    if (term) params.set("query", term);
    else params.delete("query");
    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="relative flex w-full flex-1 shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <Input
        id="search"
        className="peer h-8 max-h-8 min-h-8 pl-8"
        placeholder={placeholder}
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get("query")?.toString()}
      />
      <Search className="text-muted-foreground peer-focus:text-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
    </div>
  );
};

export default SearchProject;
