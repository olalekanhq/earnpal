import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Gift,
  PlayCircle,
  Share2,
  Wallet,
} from "lucide-react";

/** Small reusable chrome for all product mockups. */
export function MockShell({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mock-sheen overflow-hidden rounded-2xl border border-hairline bg-ink-2/90 shadow-[0_30px_60px_-40px_rgba(0,0,0,0.6)] ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-hairline px-4 py-3">
        <span className="mock-ping size-2 rounded-full bg-gold/70" />
        <span className="size-2 rounded-full bg-ink-fg/20" />
        <span className="size-2 rounded-full bg-ink-fg/20" />
        <span className="ml-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
          {title}
        </span>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

function Bar({ value, delay }: { value: number; delay: number }) {
  return (
    <div className="flex h-full w-full items-end">
      <div
        className="mock-bar w-full rounded-t-[4px] bg-gradient-to-t from-gold/30 to-gold/85"
        style={{ height: `${value}%`, animationDelay: `${delay * 0.14}s` }}
      />
    </div>
  );
}

/** Hero: balance + progress + activity, resembling the real dashboard. */
export function DashboardMock({ className = "" }: { className?: string }) {
  return (
    <MockShell title="Dashboard" className={className}>
      <div className="grid gap-3 sm:grid-cols-[1.15fr_1fr]">
        <div className="rounded-xl border border-hairline bg-ink/60 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                Points balance
              </p>
              <p className="mock-count mt-2 text-3xl font-black tracking-[-0.04em] text-ink-fg sm:text-4xl">
                12,480
              </p>
            </div>
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-gold/12 text-gold">
              <Wallet className="size-4" />
            </span>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-ink-fg/10">
            <div className="mock-fill h-full rounded-full bg-gold" style={{ ["--fill" as string]: "68%" }} />
          </div>
          <div className="mt-2 flex justify-between text-[11px] font-medium text-ink-muted">
            <span>Next reward tier</span>
            <span className="text-ink-fg/80">68%</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-hairline p-3">
              <p className="text-[11px] font-medium text-ink-muted">Today</p>
              <p className="mt-1 text-base font-black text-ink-fg">4 / 10 tasks</p>
            </div>
            <div className="rounded-lg border border-hairline p-3">
              <p className="text-[11px] font-medium text-ink-muted">Streak</p>
              <p className="mt-1 text-base font-black text-ink-fg">7 days</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-hairline bg-ink/60 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
            Recent activity
          </p>
          <ul className="mt-3 space-y-2.5">
            {[
              { icon: PlayCircle, label: "Watch & earn", value: "+40" },
              { icon: Share2, label: "Referral bonus", value: "+75" },
              { icon: CheckCircle2, label: "Task verified", value: "+120" },
              { icon: Gift, label: "Reward redeemed", value: "-2,500" },
            ].map((row, i) => (
              <li
                key={row.label}
                className="mock-row-in flex items-center gap-2.5"
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-md bg-ink-fg/6 text-gold">
                  <row.icon className="size-3.5" />
                </span>
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-ink-fg/85">
                  {row.label}
                </span>
                <span
                  className={`shrink-0 text-xs font-bold ${
                    row.value.startsWith("-") ? "text-ink-muted" : "text-gold"
                  }`}
                >
                  {row.value}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex h-16 items-end gap-1.5">
            {[38, 55, 44, 72, 60, 84, 68].map((v, i) => (
              <Bar key={i} value={v} delay={i} />
            ))}
          </div>
        </div>
      </div>
    </MockShell>
  );
}

/** Opportunity discovery list. */
export function OpportunitiesMock() {
  const items = [
    { title: "Watch a short video", meta: "Videos · instant", pts: "+40" },
    { title: "Follow on social", meta: "Social · review required", pts: "+120" },
    { title: "Daily check-in", meta: "Daily · repeatable", pts: "+20" },
    { title: "Invite a friend", meta: "Referral · on completion", pts: "+75" },
  ];
  return (
    <MockShell title="Opportunities">
      <ul className="space-y-2.5">
        {items.map((it, i) => (
          <li
            key={it.title}
            style={{ animationDelay: `${i * 0.12}s` }}
            className="mock-row-in group flex items-center gap-3 rounded-xl border border-hairline p-3 transition-colors hover:border-gold/30"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-gold/10 text-gold">
              <ArrowUpRight className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold tracking-tight text-ink-fg">{it.title}</p>
              <p className="truncate text-[11px] font-medium text-ink-muted">{it.meta}</p>
            </div>
            <span className="shrink-0 rounded-md bg-ink-fg/6 px-2 py-1 text-[11px] font-bold text-gold">
              {it.pts}
            </span>
          </li>
        ))}
      </ul>
    </MockShell>
  );
}

/** Activity history with statuses. */
export function HistoryMock() {
  const rows = [
    { label: "Task verified", status: "Verified", icon: CheckCircle2 },
    { label: "Submission under review", status: "Pending", icon: Clock3 },
    { label: "Referral credited", status: "Completed", icon: Share2 },
    { label: "Reward request sent", status: "Processing", icon: Gift },
  ];
  return (
    <MockShell title="Activity">
      <ul className="divide-y divide-[color:var(--hairline)]">
        {rows.map((r, i) => (
          <li key={r.label} style={{ animationDelay: `${i * 0.12}s` }} className="mock-row-in flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <span className="grid size-7 shrink-0 place-items-center rounded-md bg-ink-fg/6 text-gold">
              <r.icon className="size-3.5" />
            </span>
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-ink-fg/85">
              {r.label}
            </span>
            <span className="shrink-0 rounded-full border border-hairline px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-muted">
              {r.status}
            </span>
          </li>
        ))}
      </ul>
    </MockShell>
  );
}

/** Reward redemption experience. */
export function RedeemMock() {
  return (
    <MockShell title="Rewards">
      <div className="rounded-xl border border-hairline p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold tracking-tight text-ink-fg">Gift card reward</p>
            <p className="text-[11px] font-medium text-ink-muted">Costs 2,500 points</p>
          </div>
          <span className="shrink-0 rounded-lg bg-gold px-3 py-1.5 text-[11px] font-bold text-ink">
            Redeem
          </span>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-ink-fg/10">
          <div className="mock-fill h-full rounded-full bg-gold" style={{ ["--fill" as string]: "82%" }} />
        </div>
        <p className="mt-2 text-[11px] font-medium text-ink-muted">
          2,050 of 2,500 points collected
        </p>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {["Requested", "Approved", "Fulfilled"].map((s, i) => (
          <div key={s} className="rounded-lg border border-hairline p-2.5 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">{s}</p>
            <p className={`mt-1 text-xs font-black ${i === 0 ? "text-gold" : "text-ink-fg/50"}`}>
              {i === 0 ? "Now" : "—"}
            </p>
          </div>
        ))}
      </div>
    </MockShell>
  );
}
