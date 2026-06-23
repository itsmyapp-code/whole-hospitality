import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Accessibility Statement | Whole Hospitality",
  description: "Accessibility Statement outlining our WCAG 2.1 AAA contrast and layout standards.",
};

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-24 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 px-8 py-10 border-b-4 border-blue-500">
          <h1 className="text-3xl font-bold text-white mb-2">Accessibility Statement</h1>
          <h2 className="text-xl text-blue-400 font-medium">Whole Hospitality WCAG Accessibility Commitments</h2>
        </div>

        {/* Content Body */}
        <div className="p-8 sm:p-12 space-y-8 text-slate-700 leading-relaxed text-sm md:text-base">
          
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-slate-900">1. Our Commitment</h3>
            <p>
              Whole Hospitality is committed to ensuring that our website is usable and accessible to all visitors, including individuals with visual, auditory, motor, or cognitive disabilities. We aim to conform to Web Content Accessibility Guidelines (WCAG) 2.1 Level AAA standards.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-bold text-slate-900">2. Contrast Compliance</h3>
            <p>
              We enforce a strict visual contrast policy. All body text layers, headings, and input elements conform to a minimum contrast ratio of 7:1 against their backgrounds (meeting WCAG AAA specifications) to ensure optimal legibility under all lighting and hardware configurations.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-bold text-slate-900">3. Interface Design & Mechanics</h3>
            <p>
              Our layouts use standard semantic HTML5 landmarks (such as main, section, nav, and footer) to facilitate screen reader navigation. We also enforce strict viewport scaling stability to prevent layout shifts or keyboard zoom locks from disrupting assistive inputs on mobile screens.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-bold text-slate-900">4. Assistive Feedback</h3>
            <p>
              We are constantly refining our code to improve accessibility. If you experience difficulty accessing any part of our site or utilities, please reach out so we can implement the necessary adjustments.
            </p>
          </section>

        </div>
        
        {/* Return Button */}
        <div className="bg-slate-100 px-8 py-6 border-t border-slate-200 flex justify-center">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-2 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Return to Whole Hospitality Home
          </Link>
        </div>
        
      </div>
    </div>
  );
}
