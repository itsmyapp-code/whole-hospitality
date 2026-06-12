import React from "react";

export default function AuditLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 font-sans selection:bg-emerald-500/30">
      {children}
    </div>
  );
}
