import type { Metadata } from "next";
import PageBanner from "@/components/page-banner";
import TypingTestClient from "./typing-test-client";

export const metadata: Metadata = {
  title: "Typing Test — Free WPM & Accuracy Test",
  description: "Take a professional typing test: 15 seconds to 5 minutes, words, sentences, paragraphs, numbers, symbols or code. Get WPM, CPM, accuracy, consistency and a detailed results dashboard.",
  alternates: { canonical: "/typing-test" },
};

export default function TypingTestPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-6 sm:py-10">
      <PageBanner label="THE BENCHMARK / PRECISION" title="Know your speed." description="A real typing test with live WPM, accuracy, errors and consistency. Choose your mode. Beat your best." glyph="⌨" accent="#63e5e4" compact />
      <div className="mt-6"><TypingTestClient /></div>
    </div>
  );
}
