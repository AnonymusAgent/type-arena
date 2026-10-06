import type { Metadata } from "next";
import { ForgotPasswordForm } from "../(auth)/auth-forms";

export const metadata: Metadata = { title: "Forgot password", description: "Reset your Type Arena password." };

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-10 sm:py-16">
      <ForgotPasswordForm />
    </div>
  );
}
