"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { KitchenGuardLogo } from "./KitchenGuardLogo";
import {
  UtensilsCrossed,
  Bell,
  User,
  ChevronDown,
  Menu,
  X,
  Sliders,
  FileText,
  AlertTriangle,
  ClipboardCheck,
  Home,
  Sparkles,
} from "lucide-react";

export function TopNavigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Overview", href: "/", icon: Home },
    { label: "Inspections", href: "/inspections", icon: ClipboardCheck },
    { label: "Memory", href: "/memory", icon: Sparkles },
    { label: "Issues", href: "/issues", icon: AlertTriangle },
    { label: "Reports", href: "/reports", icon: FileText },
    { label: "Rules", href: "/rules", icon: Sliders },
    { label: "Settings", href: "/settings", icon: Sliders },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(28,29,27,0.04)] border-b border-surface-container-high/60">
      <div className="h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <KitchenGuardLogo />

        {/* Desktop Nav Items */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors py-2 text-sm font-medium ${
                  active
                    ? "text-primary font-semibold border-b-2 border-primary"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Station & User Controls */}
        <div className="flex items-center gap-3">
          {/* Location Selector Pill */}
          <div className="hidden sm:flex items-center gap-1.5 bg-surface-container-low hover:bg-surface-container-high text-on-surface px-3 py-1.5 rounded-full transition-colors">
            <UtensilsCrossed className="w-4 h-4 text-secondary" />
            <span className="text-xs font-semibold">Main Kitchen</span>
            <ChevronDown className="w-3.5 h-3.5 text-outline" />
          </div>

          {/* Operational Status Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium tracking-tight">Ready for Opening</span>
          </div>

          {/* Notifications */}
          <button
            aria-label="Notifications"
            className="relative p-2 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors focus:outline-none"
            type="button"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#f5a648]" />
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs text-on-surface leading-tight font-medium">Arun</span>
              <span className="text-[11px] text-secondary leading-tight">Kitchen Manager</span>
            </div>
          </div>

          {/* Mobile menu hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-surface-container-lowest border-b border-surface-container-high px-4 py-4 space-y-2 shadow-lg">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary-fixed text-on-primary-fixed font-semibold"
                    : "text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-surface-container flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-secondary">
              <UtensilsCrossed className="w-4 h-4" />
              <span>Main Kitchen · Shift Active</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
