import type { Metadata } from "next";
import { LoginForm } from "../(auth)/auth-forms";

export const metadata: Metadata = { title: "Log in", description: "Log in to Type Arena to save XP, coins, achievements and leaderboard progress." };

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-10 sm:py-16">
      <LoginForm />
    </div>
  );
}
