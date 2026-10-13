"use client";

import { Bot, SendHorizontal, Sparkles, Square, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import MarkdownRender from "@/components/dashboad/project/task/markdown-render";
import Avatar from "@/components/navbar/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { notify } from "@/lib/notify";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Summarise where this project stands",
  "Suggest the next 5 tasks by priority",
  "Draft a README outline from the docs",
  "What risks do you see in the open tasks?",
];

export default function AiChat({
  projectId,
  userName,
  userImage,
  model,
}: {
  projectId: string;
  userName: string;
  userImage: string;
  model: string;
}) {
  const storageKey = `ai-chat:${projectId}`;
  // Rendered client-only (see ai-chat-loader), so localStorage is safe here.
  const [messages, setMessages] = useState<Msg[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) ?? "[]") as Msg[];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Conversation is kept per project in this browser only.
  useEffect(() => {
    if (!streaming)
      localStorage.setItem(storageKey, JSON.stringify(messages.slice(-40)));
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, streaming, storageKey]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || streaming) return;
    const history: Msg[] = [...messages, { role: "user", content }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`/api/v1/projects/${projectId}/ai`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-20) }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? "The assistant is unavailable");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let reply = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "assistant", content: reply }]);
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        notify.error("Assistant error", (error as Error).message);
        setMessages(history);
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  return (
    <div className="flex h-[calc(100dvh-3rem)] flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.length === 0 ? (
            <div className="mesh flex flex-col items-center gap-4 rounded-2xl border px-6 py-12 text-center">
              <span className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
                <Sparkles className="size-4" />
              </span>
              <div>
                <h2 className="section-title">
                  How can I help with this project?
                </h2>
                <p className="text-muted-foreground text-sm">
                  I can see the project description, tasks, docs and saved
                  references.
                </p>
              </div>
              <div className="grid w-full gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <Button
                    key={s}
                    variant="outline"
                    className="h-auto justify-start py-2 text-left text-xs whitespace-normal"
                    onClick={() => send(s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className="flex gap-3">
                {m.role === "user" ? (
                  <Avatar
                    name={userName}
                    image={userImage}
                    size="base"
                    className="shrink-0"
                  />
                ) : (
                  <span className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-full">
                    <Bot className="size-4" />
                  </span>
                )}
                <div className="min-w-0 flex-1 pt-1">
                  {m.content ? (
                    m.role === "assistant" ? (
                      <MarkdownRender>{m.content}</MarkdownRender>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                    )
                  ) : (
                    <Spinner className="text-muted-foreground" />
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={endRef} />
        </div>
      </div>

      <form
        className="bg-background/80 border-t p-3 backdrop-blur md:p-4"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <Textarea
            aria-label="Message the assistant"
            rows={2}
            className="max-h-48 min-h-11 resize-none"
            placeholder="Ask about this project… (Enter to send, Shift+Enter for a new line)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
          />
          {streaming ? (
            <Button
              type="button"
              size="icon"
              variant="outline"
              aria-label="Stop"
              onClick={() => abortRef.current?.abort()}
            >
              <Square className="size-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              aria-label="Send"
              disabled={!input.trim()}
            >
              <SendHorizontal className="size-4" />
            </Button>
          )}
          {messages.length > 0 && !streaming && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Clear conversation"
              onClick={() => setMessages([])}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
        <p className="text-muted-foreground mx-auto mt-1 max-w-3xl text-[10px]">
          Model: {model}. Answers can be wrong; verify important details.
        </p>
      </form>
    </div>
  );
}
