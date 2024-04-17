import { SiteConfigContracts } from "@/config/site";
import { aiAppAbi } from "@/contracts/abi/ai-app-abi";
import useError from "@/hooks/useError";
import { executeViaSmartAccount } from "@/lib/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { encodeFunctionData, isAddress } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { z } from "zod";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { useToast } from "./ui/use-toast";

export function AIAppWithdrawDialog(props: {
  aiApp: string;
  contracts: SiteConfigContracts;
  onWithdraw: () => {};
}) {
  const { handleError } = useError();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const formSchema = z.object({
    destination: z.string().length(42),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsFormSubmitting(true);
      // Check public client
      if (!publicClient) {
        throw new Error("Public client is not ready");
      }
      // Check wallet
      if (!address || !walletClient) {
        throw new Error("Wallet is not connected");
      }
      // Check address
      if (!isAddress(values.destination)) {
        throw new Error("Specified address is incorrect");
      }
      // Send request
      let setParamstxHash;
      if (props.contracts.accountAbstractionSuported) {
        setParamstxHash = await executeViaSmartAccount(
          address,
          props.contracts.aiApp,
          encodeFunctionData({
            abi: aiAppAbi,
            functionName: "withdraw",
            args: [BigInt(props.aiApp), values.destination],
          }),
          props.contracts
        );
      } else {
        setParamstxHash = await walletClient.writeContract({
          address: props.contracts.aiApp,
          abi: aiAppAbi,
          functionName: "withdraw",
          args: [BigInt(props.aiApp), values.destination],
          chain: props.contracts.chain,
        });
      }
      await publicClient.waitForTransactionReceipt({
        hash: setParamstxHash as `0x${string}`,
      });
      // Show success message
      toast({
        title: "Withdrawn successfully 👌",
      });
      props.onWithdraw();
      form.reset();
      setIsOpen(false);
    } catch (error: any) {
      handleError(error, true);
    } finally {
      setIsFormSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Withdraw Balance
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Withdraw to a specified address</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-2"
          >
            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="0x0000000000000000000000000000000000000000"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isFormSubmitting}>
                {isFormSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
