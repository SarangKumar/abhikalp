"use client";
import { useState, type RefObject, useEffect } from "react";

interface Props {
  cursor: { x: number; y: number };
  cardRef: RefObject<HTMLElement | null>;
  mouseOnCard: boolean;
}

const Flame = ({ cursor, cardRef, mouseOnCard }: Props) => {
  const [gradientCenter, setGradientCenter] = useState({
    cx: "50%",
    cy: "50%",
  });

  useEffect(() => {
    if (cardRef.current && cursor.x !== null && cursor.y !== null) {
      const cardRect = cardRef.current.getBoundingClientRect();
      const cxPercentage = (cursor.x / cardRect.width) * 100 - 24;
      const cyPercentage = (cursor.y / cardRect.height) * 100;
      setGradientCenter({
        cx: `${cxPercentage}%`,
        cy: `${cyPercentage}%`,
      });
    }
  }, [cursor, cardRef]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="h-72 w-72 transition-all duration-200"
    >
      <defs className="group-hover/card:shadow-md">
        <radialGradient
          id="primaryGradient"
          gradientUnits="userSpaceOnUse"
          r="35%"
          cx={gradientCenter.cx}
          cy={gradientCenter.cy}
        >
          {mouseOnCard && <stop stopColor="var(--primary)" />}
          <stop offset={1} stopColor="var(--muted-foreground)" />
        </radialGradient>
      </defs>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        className="fill-background/50"
        stroke="url(#primaryGradient)"
        d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        className="fill-muted/60"
        stroke="url(#primaryGradient)"
        d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z"
      />
    </svg>
  );
};

export default Flame;
