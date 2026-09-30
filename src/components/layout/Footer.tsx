import React from "react";
import { ShieldCheck, Mic } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-surface-container-low py-6 border-t border-surface-container mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-secondary text-xs">
        <span>© 2026 KitchenGuard Technologies Inc. Michelin-standard culinary operations.</span>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5 font-medium text-on-surface">
            <ShieldCheck className="w-4 h-4 text-primary" />
            HACCP Compliant
          </span>
          <span className="flex items-center gap-1.5 font-medium text-on-surface">
            <Mic className="w-4 h-4 text-primary" />
            AssemblyAI Voice Engine Ready
          </span>
        </div>
      </div>
    </footer>
  );
}
