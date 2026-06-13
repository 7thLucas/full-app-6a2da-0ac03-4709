import { useMemo, useState } from "react";
import { Link } from "react-router";
import { formatDistanceToNow } from "date-fns";
import { Search, MessageCircle, Mail, MessageSquare } from "lucide-react";
import { RequireAuth } from "~/components/require-auth";
import { PageHeader } from "~/components/page-header";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { EmptyState, PageLoader } from "~/components/states";
import { useApi } from "~/lib/app.api";
import { initials, avatarTint, type Thread } from "~/lib/domain";

export function meta() {
  return [{ title: "Messages — Radiance AI" }];
}

function MessagesContent() {
  const { data, loading } = useApi<Thread[]>("/api/app/messages/threads");
  const [q, setQ] = useState("");
  const threads = data ?? [];

  const filtered = useMemo(
    () =>
      threads.filter((t) =>
        t.contactName.toLowerCase().includes(q.trim().toLowerCase()),
      ),
    [threads, q],
  );

  if (loading) return <PageLoader />;

  return (
    <>
      <PageHeader
        title="Messages"
        subtitle="SMS and email conversations with your patients in one inbox."
      />

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search conversations"
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title={q ? "No matches" : "No conversations yet"}
          description={
            q
              ? "Try a different name."
              : "Messages from leads and patients will land here. Send one from any lead's profile."
          }
        />
      ) : (
        <Card className="divide-y divide-border p-0">
          {filtered.map((t) => {
            const Channel = t.lastChannel === "email" ? Mail : MessageSquare;
            return (
              <Link
                key={t.contactId}
                to={`/messages/${t.contactId}`}
                className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/50"
              >
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{ backgroundColor: avatarTint(t.contactName) }}
                >
                  {initials(t.contactName)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium text-foreground">{t.contactName}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(t.lastAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <Channel className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <p className="truncate text-[13px] text-muted-foreground">{t.lastMessage}</p>
                  </div>
                </div>
                {t.unread > 0 && (
                  <Badge variant="plum" className="shrink-0">
                    {t.unread}
                  </Badge>
                )}
              </Link>
            );
          })}
        </Card>
      )}
    </>
  );
}

export default function MessagesRoute() {
  return (
    <RequireAuth>
      <MessagesContent />
    </RequireAuth>
  );
}
