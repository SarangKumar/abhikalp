import { CircleCheckBig } from "lucide-react";
import React from "react";

const FeatureListItem = ({ feature }: { feature: string }) => {
  return (
    <li className="flex items-center gap-x-2 text-sm">
      <CircleCheckBig className="size-4" /> {feature}
    </li>
  );
};

export default FeatureListItem;
