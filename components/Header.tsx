"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, Search, UserRoundArrowLeft, X } from "lucide-react";

import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { adminSidebarLinks } from "@/constants";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

const handleSignOut = () => {
  signOut({ callbackUrl: "/sign-in" });
};

export default function Header({ session }: { session: Session }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <button
          type="button"
          className="mobile-menu-button"
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <Menu className="size-5" />
        </button>

        <Link href="/dashboard" className="mobile-header-logo">
          <Image
            src="/images/logo1.svg"
            alt="PowerOps"
            width={132}
            height={34}
            className="h-8 w-auto"
            style={{ width: "auto" }}
          />
        </Link>

        <div className="app-header-search">
          <div className="app-search-box">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search dashboard..."
              className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="app-header-actions">
          <button
            type="button"
            className="relative rounded-xl p-2 transition hover:bg-muted"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          <button
            type="button"
            className="header-avatar-button"
            aria-label="Current user"
          >
            <UserRoundArrowLeft className="size-5" />
          </button>

          <Button
            onClick={handleSignOut}
            variant="outline"
            className="header-user-button"
          >
            {session?.user?.name ?? "Sign out"}
          </Button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-nav-shell lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="mobile-nav-backdrop"
            aria-label="Close navigation menu"
            onClick={() => setMenuOpen(false)}
          />

          <aside className="mobile-nav-panel">
            <div className="mobile-nav-header">
              <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                <Image
                  src="/images/logo1.svg"
                  alt="PowerOps"
                  width={150}
                  height={38}
                  className="h-9 w-auto"
                  style={{ width: "auto" }}
                />
              </Link>
              <button
                type="button"
                className="mobile-menu-button"
                aria-label="Close navigation menu"
                onClick={() => setMenuOpen(false)}
              >
                <X className="size-5" />
              </button>
            </div>

            <nav className="mobile-nav-list">
              {adminSidebarLinks.map((group) => (
                <div key={group.title} className="sidebar-group">
                  <p className="sidebar-group-title">{group.title}</p>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active =
                        pathname === item.href ||
                        pathname.startsWith(item.href + "/");

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "sidebar-item",
                            active && "sidebar-item-active"
                          )}
                          onClick={() => setMenuOpen(false)}
                        >
                          <Icon size={20} />
                          <span>{item.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </header>
  );
}
