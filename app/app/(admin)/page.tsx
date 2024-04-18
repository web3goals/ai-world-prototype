import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="container flex flex-col items-center justify-center gap-6 pb-8 pt-6 lg:h-[calc(100vh-4rem)]">
      {/* Text with button */}
      <section className="flex flex-col items-center py-8">
        <h1 className="text-4xl font-extrabold tracking-tighter text-center md:text-5xl">
          Launch and monetize your AI apps without code
        </h1>
        <h2 className="text-2xl font-normal tracking-tight text-center text-muted-foreground mt-4">
          Creation, hosting, analytics, customization and different models in
          one crypto platform
        </h2>
        <Link href="/dashboard">
          <Button className="mt-6" size="lg">
            Open Dashboard
          </Button>
        </Link>
      </section>
      {/* Image */}
      <section className="flex flex-col items-center max-w-[580px]">
        <Image
          src="/images/ai-apps.png"
          alt="AI Apps"
          priority={false}
          width="100"
          height="100"
          sizes="100vw"
          className="w-full"
        />
      </section>
    </div>
  );
}
