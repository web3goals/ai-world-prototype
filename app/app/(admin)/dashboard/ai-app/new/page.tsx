import { AIAppCreateForm } from "@/components/ai-app-create-form";
import { Separator } from "@/components/ui/separator";

export default function DashboardNewAIAppPage() {
  return (
    <div className="container py-10 lg:px-80">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">AI App</h2>
        <p className="text-muted-foreground">
          What do you want to offer the AI world?
        </p>
      </div>
      <Separator className="my-6" />
      <AIAppCreateForm />
    </div>
  );
}
