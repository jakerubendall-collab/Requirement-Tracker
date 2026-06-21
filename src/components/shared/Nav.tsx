"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { brandConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import {
  Building2, LayoutDashboard, ClipboardList, LogOut, User
} from "lucide-react";

interface NavProps {
  role: "BROKER" | "SELLER";
  userName: string;
}

const brokerLinks = [
  { href: "/broker/dashboard", label: "Portfolio", icon: LayoutDashboard },
  { href: "/broker/requirements", label: "Requirements", icon: ClipboardList },
];

export function Nav({ role, userName }: NavProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href={role === "BROKER" ? "/broker/dashboard" : "/client/dashboard"} className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white text-sm font-bold tracking-wide"
            style={{ backgroundColor: brandConfig.accent }}
          >
            {brandConfig.logoText}
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold text-gray-900 leading-tight">{brandConfig.firmName}</div>
            <div className="text-xs text-gray-500">{brandConfig.portalName}</div>
          </div>
        </Link>

        {role === "BROKER" && (
          <nav className="hidden md:flex items-center gap-1">
            {brokerLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname.startsWith(href)
                    ? "bg-[#003087]/10 text-[#003087]"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="h-4 w-4 text-gray-500" />
            </div>
            <span className="hidden sm:block font-medium text-gray-900">{userName}</span>
            <span className="hidden sm:block text-xs text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">
              {role === "BROKER" ? "Broker" : "Client"}
            </span>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors px-2 py-1.5 rounded-md hover:bg-gray-100"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:block">Sign out</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
