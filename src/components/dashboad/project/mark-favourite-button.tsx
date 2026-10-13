"use client";

import { Star } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";

const MarkFavouriteButton = ({
  projectId,
  isFavourite,
}: {
  projectId: string;
  isFavourite: boolean;
}) => {
  const [loading, setLoading] = useState(false);
  const [favourite, setFavourite] = useState(isFavourite);

  const handleFavourite = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/project/favourite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = await res.json();
      if (data.success) {
        setFavourite(data.data.isFavourite);
        notify.success(
          data.data.isFavourite
            ? "Project marked as favourite"
            : "Project marked as not favourite"
        );
      } else {
        notify.error("Failed to mark project as favourite");
      }
    } catch (error) {
      console.error(error);
      notify.error("Failed to mark project as favourite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleFavourite}
      className="z-20"
      size="icon-sm"
      disabled={loading}
    >
      {loading ? (
        <Spinner />
      ) : (
        <>
          <Star
            className={cn(
              "size-3.5",
              favourite && "fill-primary stroke-primary"
            )}
          />
          <span className="sr-only">
            {favourite ? "Marked favourite" : "Marked not favourite"}
          </span>
        </>
      )}
    </Button>
  );
};

export default MarkFavouriteButton;
