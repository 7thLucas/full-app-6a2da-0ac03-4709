import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { format } from "date-fns";
import { ArrowLeft, Send, Sparkles, FileText, Mail, MessageSquare } from "lucide-react";
import { RequireAuth } from "~/components/require-auth";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Spinner } from "~/components/states";
import { api, useApi } from "~/lib/app.api";
import { cn } from "~/lib/utils";
import { initials, avatarTint, type Message, type MessageTemplate } from "~/lib/domain";

export function meta() {
  return [{ title: "Conversation — Radiance AI" }];
}

function ThreadContent() {
  const { contactId } = useParams();
  const { data, loading, refetch } = useApi<Message[]>(
    `/api/app/messages/thread/${contactId}`,
    undefined,
    [contactId],
  );
  const { data: templates } = useApi<MessageTemplate[]>("/api/app/templates");
  const [channel, setChannel] = useState<"sms" | "email">("sms");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = data ?? [];
  const contactName = messages[0]?.contactName || "Conversation";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend() {
    if (!body.trim()) return;
    setSending(true);
    await api.post("/api/app/messages", {
      contactId,
      contactName,
      channel,
      body: body.trim(),
    });
    setBody("");
    setSending(false);
    refetch();
  }

  const channelTemplates = (templates ?? []).filter(
    (t) => t.channel === channel || t.channel === "both" || !t.channel,
  );

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col md:h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="mb-3 flex items-center gap-3">
        <Button asChild variant="ghost" size="icon-sm">
          <Link to="/messages" aria-label="Back to inbox">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: avatarTint(contactName) }}
        >
          {initials(contactName)}
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-semibold text-foreground">
            {contactName}
          </p>
          <p className="text-xs text-muted-foreground">SMS &amp; email thread</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-border bg-card/40 p-4">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner className="h-7 w-7" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground">
            <MessageSquare className="mb-2 h-8 w-8 text-muted-foreground/50" strokeWidth={1.5} />
            No messages yet. Start the conversation below.
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => {
              const out = m.direction === "outbound";
              const Channel = m.channel === "email" ? Mail : MessageSquare;
              return (
                <div
                  key={m._id}
                  className={cn("flex", out ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm",
                      out
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-card text-foreground",
                    )}
                  >
                    <p className="whitespace-pre-wrap">{m.body}</p>
                    <div
                      className={cn(
                        "mt-1 flex items-center gap-1 text-[11px]",
                        out ? "text-primary-foreground/70" : "text-muted-foreground",
                      )}
                    >
                      <Channel className="h-3 w-3" />
                      {m.isAutomated && (
                        <Sparkles className="h-3 w-3" />
                      )}
                      {format(new Date(m.createdAt), "MMM d, h:mm a")}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="mt-3 rounded-2xl border border-border bg-card p-3">
        <div className="mb-2 flex items-center gap-2">
          <div className="inline-flex rounded-lg bg-muted p-0.5">
            <button
              onClick={() => setChannel("sms")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                channel === "sms" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              <MessageSquare className="h-3.5 w-3.5" /> SMS
            </button>
            <button
              onClick={() => setChannel("email")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                channel === "email" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              <Mail className="h-3.5 w-3.5" /> Email
            </button>
          </div>
          {channelTemplates.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4" /> Templates
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-72 p-1.5">
                <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Insert a template
                </p>
                <ul className="max-h-64 overflow-y-auto">
                  {channelTemplates.map((t) => (
                    <li key={t._id}>
                      <button
                        onClick={() =>
                          setBody((b) => (b ? `${b}\n${t.body}` : t.body))
                        }
                        className="w-full rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted"
                      >
                        <p className="text-sm font-medium text-foreground">{t.name}</p>
                        <p className="line-clamp-2 text-xs text-muted-foreground">{t.body}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              </PopoverContent>
            </Popover>
          )}
        </div>
        <div className="flex items-end gap-2">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={`Write a ${channel === "email" ? "email" : "text"}…`}
            rows={2}
            className="min-h-[44px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend();
            }}
          />
          <Button onClick={handleSend} disabled={sending || !body.trim()} size="icon">
            {sending ? <Spinner className="h-4 w-4 border-primary-foreground/40 border-t-primary-foreground" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ThreadRoute() {
  return (
    <RequireAuth>
      <ThreadContent />
    </RequireAuth>
  );
}
