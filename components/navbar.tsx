"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mountain } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/help", label: "Help" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 group-hover:glow-subtle transition-all">
              <Mountain className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Agent Iceberg
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    "hover:bg-white/5 hover:text-primary",
                    isActive
                      ? "text-primary bg-primary/10 glow-subtle"
                      : "text-muted-foreground"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
