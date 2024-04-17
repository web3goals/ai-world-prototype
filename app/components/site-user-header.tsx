"use client";

import { siteConfig } from "@/config/site";
import Link from "next/link";
import { SiteHeaderConnectButton } from "./site-header-connect-button";
import { ThemeToggle } from "./theme-toggle";

export function SiteUserHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="inline-block text-primary font-bold">
              {siteConfig.emoji}{" "}
              <span className="hidden md:inline-block">{siteConfig.name}</span>
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-8">
          <SiteHeaderConnectButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
