import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { label: "Opportunities", href: "#opportunities" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Benefits", href: "#benefits" },
  { label: "FAQ", href: "#faq" },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled
          ? "border-b border-hairline bg-ink/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 sm:px-6 md:h-20 lg:grid-cols-[auto_1fr_auto]">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <img src="/logo.png" alt="Earn Pal" className="h-8 w-8 shrink-0 object-contain" />
          <span className="truncate text-[17px] font-black tracking-[-0.03em] text-ink-fg">
            Earn<span className="text-gold">Pal</span>
          </span>
        </Link>

        <nav className="hidden items-center justify-center gap-8 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[13px] font-semibold tracking-tight text-ink-muted transition-colors hover:text-ink-fg"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-2 sm:gap-3">
          <Link
            to="/auth"
            className="hidden text-[13px] font-semibold text-ink-muted transition-colors hover:text-ink-fg sm:block"
          >
            Sign In
          </Link>
          <Link
            to="/auth"
            className="group inline-flex h-10 items-center gap-1.5 rounded-xl bg-gold px-4 text-[13px] font-bold tracking-tight text-ink transition-transform duration-200 hover:-translate-y-0.5"
          >
            Get Started
            <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="grid size-10 place-items-center rounded-xl border border-hairline text-ink-fg lg:hidden"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <div
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 bg-ink/80 backdrop-blur-sm transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cn(
            "absolute inset-x-3 top-3 rounded-2xl border border-hairline bg-ink-2 p-5 transition-all duration-300",
            open ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0",
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-base font-black tracking-[-0.03em] text-ink-fg">
              Earn<span className="text-gold">Pal</span>
            </span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="grid size-9 place-items-center rounded-xl border border-hairline text-ink-fg"
            >
              <X className="size-4" />
            </button>
          </div>
          <nav className="mt-6 flex flex-col">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-hairline py-3.5 text-base font-semibold tracking-tight text-ink-fg/85"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mt-6 grid gap-2.5">
            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className="grid h-12 place-items-center rounded-xl bg-gold text-sm font-bold text-ink"
            >
              Get Started
            </Link>
            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className="grid h-12 place-items-center rounded-xl border border-hairline text-sm font-semibold text-ink-fg"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
