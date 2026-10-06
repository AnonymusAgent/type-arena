"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers";
import { LogOut, RefreshCw, ShieldCheck } from "lucide-react";

type Props = { admin: { username: string; avatar: string; level: number } };

export default function AdminBar({ admin }: Props) {
  const { toast } = useApp();
  const router = useRouter();

  const refresh = () => {
    router.refresh();
    toast("Admin data refreshed.", "success");
  };

  const endSession = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <header className="panel flex flex-col gap-4 rounded-2xl p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[#c5fb56]/35 bg-[#c5fb56]/10 text-2xl" aria-hidden="true">
          {admin.avatar}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h1 className="text-xl font-bold leading-tight tracking-tight sm:text-2xl">Operator Control Panel</h1>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-[#c5fb56]/30 bg-[#c5fb56]/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-[#c5fb56]">
              <ShieldCheck size={11} aria-hidden="true" /> Authenticated
            </span>
          </div>
          <p className="mt-1.5 break-words text-xs leading-relaxed text-[var(--muted)]">
            Signed in as <strong className="text-[var(--text)]">{admin.username}</strong> · level {admin.level} · full catalogue access
          </p>
        </div>
      </div>

      <div className="grid w-full shrink-0 grid-cols-2 gap-2 sm:w-auto sm:grid-cols-[auto_auto_auto] lg:ml-auto">
        <Link href="/" className="btn btn-ghost !min-h-11 text-xs">
          Public site
        </Link>
        <button type="button" className="btn btn-ghost !min-h-11 text-xs" onClick={refresh}>
          <RefreshCw size={14} aria-hidden="true" /> Refresh
        </button>
        <button type="button" className="btn btn-primary col-span-2 !min-h-11 text-xs sm:col-span-1" onClick={() => void endSession()}>
          <LogOut size={14} aria-hidden="true" /> End admin session
        </button>
      </div>
    </header>
  );
}
