"use client";

import React, { useState } from "react";
import { AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";

interface Question {
  id: number;
  text: string;
  category: "The Money" | "The Venue" | "The Team & Risk";
}

const questions: Question[] = [
  {
    id: 1,
    text: "Can you guarantee you aren't losing 4% GP to hidden kitchen waste right now?",
    category: "The Money",
  },
  {
    id: 2,
    text: "Do you know exactly who has custody of your backup master keys this second?",
    category: "The Venue",
  },
  {
    id: 3,
    text: "If a premium bottle (like Grey Goose) goes missing, will your current stock logs flag it before next month's count?",
    category: "The Money",
  },
  {
    id: 4,
    text: "Are your digital compliance logbooks completely audit-ready for a surprise inspection tomorrow?",
    category: "The Team & Risk",
  },
];

export default function RealityCheck() {
  const [answers, setAnswers] = useState<Record<number, "YES" | "NO" | null>>({
    1: null,
    2: null,
    3: null,
    4: null,
  });

  const handleAnswer = (qId: number, option: "YES" | "NO") => {
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  // Check if any question has been answered "NO"
  const noAnswers = Object.entries(answers).filter(
    ([qId, val]) => val === "NO"
  );
  const hasLeaks = noAnswers.length > 0;

  // Determine which unique categories have gaps/leaks
  const failedCategories = Array.from(
    new Set(
      noAnswers.map(([qId]) => {
        const question = questions.find((q) => q.id === parseInt(qId));
        return question ? question.category : null;
      }).filter(Boolean)
    )
  );

  // Format categories list: "A, B and C"
  const formatCategories = (cats: string[]) => {
    if (cats.length === 0) return "";
    if (cats.length === 1) return cats[0];
    if (cats.length === 2) return `${cats[0]} and ${cats[1]}`;
    return `${cats.slice(0, -1).join(", ")}, and ${cats[cats.length - 1]}`;
  };

  // Track if all questions have been answered
  const allAnswered = Object.values(answers).every((val) => val !== null);

  return (
    <section className="py-24 px-6 md:px-12 bg-slate-50 text-slate-900 font-sans border-t border-slate-200" id="reality-check">
      <div className="max-w-4xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-12 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Self-Diagnostic
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            The 5-Minute Reality Check
          </h2>
          <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto">
            Is your backend operation truly watertight? Take the check to expose hidden leaks.
          </p>
        </div>

        {/* Quiz Container Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-xl space-y-8">
          
          {/* Question List */}
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div 
                key={q.id} 
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-55/40 border border-slate-100 hover:bg-slate-50/60 transition-colors"
              >
                <div className="space-y-1 max-w-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Diagnostic check 0{idx + 1} // {q.category}
                  </span>
                  <p className="text-base font-semibold text-slate-800 leading-relaxed">
                    {q.text}
                  </p>
                </div>

                {/* Yes/No Action Buttons */}
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => handleAnswer(q.id, "YES")}
                    className={`px-6 py-2 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                      answers[q.id] === "YES"
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/10"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    YES
                  </button>
                  <button
                    onClick={() => handleAnswer(q.id, "NO")}
                    className={`px-6 py-2 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                      answers[q.id] === "NO"
                        ? "bg-red-600 border-red-600 text-white shadow-md shadow-red-500/10"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    NO
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Dynamic Logic Outcomes */}
          {allAnswered && (
            <div className="pt-6 border-t border-slate-100 animate-in fade-in duration-500">
              {hasLeaks ? (
                <div className="space-y-6">
                  {/* Warning Banner */}
                  <div className="bg-red-50 border border-red-100 p-6 rounded-2xl flex items-start gap-4 text-red-800 shadow-sm">
                    <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-bold text-base md:text-lg">Potential Margin Leaks Detected</h4>
                      <p className="text-sm text-red-700 leading-relaxed">
                        Your operation has open gaps in <strong className="text-red-900 font-bold">{formatCategories(failedCategories as string[])}</strong>. Left unaddressed, these issues directly compromise margins, physical security, and regulatory compliance.
                      </p>
                    </div>
                  </div>

                  {/* Inline Book Audit CTA */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
                    <div className="space-y-1">
                      <h5 className="font-bold text-sm uppercase tracking-wider text-blue-400">Next Recommended Step</h5>
                      <p className="text-xs text-slate-300">Get a professional physical audit to lock down your backend processes.</p>
                    </div>
                    <a 
                      href="mailto:info@wholehospitality.co.uk?subject=Reality-Check%20Audit%20Inquiry"
                      className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all transform hover:scale-105 shrink-0 shadow-lg shadow-blue-500/10 cursor-pointer"
                    >
                      Book Your Reality-Check Audit
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ) : (
                /* Success/Clean Banner */
                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex items-start gap-4 text-emerald-800 shadow-sm">
                  <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-base md:text-lg">Systems Appear Secure</h4>
                    <p className="text-sm text-emerald-700 leading-relaxed">
                      Excellent work. Based on your answers, your operation exhibits strong baseline compliance, key security, and cost tracking. Continue running regular physical reviews to maintain integrity.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
