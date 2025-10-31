"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Role } from "@/slimy.config";
import { UsageBadge } from "@/components/usage-badge";

interface User {
  id: string;
  name: string;
}

interface HeaderProps {
  user?: User | null;
  role?: Role;
  loading?: boolean;
}

const navItems = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/docs", label: "Docs" },
  { href: "/status", label: "Status" },
];

export function Header({ user, role, loading }: HeaderProps) {
  const pathname = usePathname();
  const adminApiBase = process.env.NEXT_PUBLIC_ADMIN_API_BASE;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <Image 
              src="/images/logo.svg" 
              alt="slimy.ai Logo" 
              width={40} 
              height={40}
              className="w-10 h-10"
            />
            <span className="text-2xl font-bold text-neon-green">slimy.ai</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-neon-green",
                  pathname === item.href
                    ? "text-neon-green"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

	        <div className="flex items-center gap-4">
	          <UsageBadge />
	          {loading ? (
	            <Skeleton className="h-8 w-24" />
	          ) : user ? (
	            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.name}
              </span>
              {role && role !== "user" && (
                <Badge variant={role as "admin" | "club"}>
                  {role.toUpperCase()}
                </Badge>
              )}
              <Link href={role === "admin" ? "/guilds" : role === "club" ? "/club" : "/snail"}>
                <Button variant="neon" size="sm">
                  Dashboard
                </Button>
              </Link>
            </div>
          ) : (
            <Link href={adminApiBase ? `${adminApiBase}/api/auth/login` : "#"}>
              <Button variant="neon" size="sm">
                <span className="md:hidden">Login</span>
                <span className="hidden md:inline">Login with Discord</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
