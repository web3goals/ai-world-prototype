"use client";

import { AIApp } from "@/components/ai-app";
import useSiteConfigContracts from "@/hooks/useSiteConfigContracts";

export default function AIAppPage({
  params,
}: {
  params: { chain: number; id: string };
}) {
  const { contracts } = useSiteConfigContracts(params.chain);

  return (
    <div className="container py-10 lg:px-96">
      <AIApp aiApp={params.id} contracts={contracts} />
    </div>
  );
}
