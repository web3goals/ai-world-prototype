import { SiteFooter } from "@/components/site-footer";
import { SiteUserHeader } from "@/components/site-user-header";
import { Toaster } from "@/components/ui/toaster";
import "@/styles/globals.css";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteUserHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
      <Toaster />
    </div>
  );
}
