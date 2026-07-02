"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminSidebarLinks } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";


export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
         <Link href="/" className="flex items-center">
          <Image
            src="/images/logo1.svg"
            alt="PowerOps"
            width={170}
            height={42}
            className="h-9 w-auto mt-4 ml-4"
            style={{ width: "auto" }}
          />
        </Link>
      <nav className="sidebar-nav">
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
  );
}
