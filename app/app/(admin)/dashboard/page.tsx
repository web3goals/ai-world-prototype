import { AIAppList } from "@/components/ai-app-list";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { siteConfig } from "@/config/site";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="container py-10 lg:px-80">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          AI apps you offer in the AI world
        </p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col items-start gap-6">
        <Link href="/dashboard/ai-app/new">
          <Button>Create AI App</Button>
        </Link>
        {Object.values(siteConfig.contracts).map((contracts, index) => (
          <AIAppList key={index} contracts={contracts} />
        ))}
      </div>
    </div>
  );
}
