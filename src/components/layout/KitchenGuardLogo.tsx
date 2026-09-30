import React from "react";
import Link from "next/link";

interface KitchenGuardLogoProps {
  className?: string;
  size?: number;
  showSubtitle?: boolean;
}

export function KitchenGuardLogo({
  className = "",
  size = 32,
  showSubtitle = true,
}: KitchenGuardLogoProps) {
  return (
    <Link href="/" className={`inline-flex items-center gap-3 group focus:outline-none ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        width={size}
        height={size}
        fill="none"
        className="flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
        aria-label="KitchenGuard Shield Logo"
      >
        <path
          d="M24 4L7 11V23.5C7 34.2 14.3 43.6 24 46C33.7 43.6 41 34.2 41 23.5V11L24 4Z"
          fill="#2E4F32"
        />
        <path
          d="M16 23.5L21.5 29L32 18.5"
          stroke="#FAF8F5"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="34" cy="14" r="2.5" fill="#A4C2A5" />
      </svg>
      <div className="flex items-baseline gap-1.5">
        <span className="font-sans text-xl font-bold tracking-tight text-primary">
          KitchenGuard
        </span>
        {showSubtitle && (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-secondary px-1.5 py-0.5 rounded bg-surface-container-high">
            Hospitality OS
          </span>
        )}
      </div>
    </Link>
  );
}
