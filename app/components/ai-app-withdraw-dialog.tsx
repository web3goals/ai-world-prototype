"use client";

import { SiteConfigContracts } from "@/config/site";
import { Button } from "./ui/button";

// TODO: Implement
export function AIAppWithdrawDialog(props: {
  aiApp: string;
  contracts: SiteConfigContracts;
  onWithdraw: () => void;
}) {
  return <Button variant="outline">Withdraw Balance</Button>;
}
