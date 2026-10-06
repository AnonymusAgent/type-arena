import type { Metadata } from "next";
import { SignupForm } from "../(auth)/auth-forms";

export const metadata: Metadata = { title: "Sign up", description: "Create a free Type Arena account and keep every point you earn." };

export default function SignupPage() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-10 sm:py-16">
      <SignupForm />
    </div>
  );
}
