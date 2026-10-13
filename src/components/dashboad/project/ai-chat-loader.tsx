"use client";

import dynamic from "next/dynamic";

import { Spinner } from "@/components/ui/spinner";

/** The chat reads localStorage on first render, so it is client-only. */
const AiChat = dynamic(() => import("./ai-chat"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[60dvh] items-center justify-center">
      <Spinner />
    </div>
  ),
});

export default AiChat;
