import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { safeAdminRedirect } from "@/lib/admin";
import AdminLoginForm from "./admin-login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Restricted sign-in",
  description: "Authorised personnel only.",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const sp = await searchParams;
  const next = safeAdminRedirect(Array.isArray(sp.next) ? sp.next[0] : sp.next);

  // Exactly the same database check the dashboard uses. We only redirect on a positive
  // admin result, so this page and /admin can never send a visitor back and forth.
  const user = await getCurrentUser();
  if (user?.isAdmin) redirect(next);

  return (
    <div className="bg-grid flex min-h-[calc(100dvh-64px)] w-full items-center justify-center px-4 py-12">
      <AdminLoginForm next={next} signedInAs={user ? user.username : null} />
    </div>
  );
}
