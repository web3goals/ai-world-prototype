"use client";

import { siteConfig } from "@/config/site";
import { aiAppAbi } from "@/contracts/abi/ai-app-abi";
import useError from "@/hooks/useError";
import { executeViaSmartAccount } from "@/lib/actions";
import { uploadJsonToIpfs } from "@/lib/ipfs";
import { chainToSiteConfigContracts } from "@/lib/site-config";
import { AIAppMetadata } from "@/types/ai-app-metadata";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  encodeFunctionData,
  isAddress,
  parseEther,
  parseEventLogs,
} from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { z } from "zod";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { toast } from "./ui/use-toast";

export function AIAppCreateForm() {
  const { handleError } = useError();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  const router = useRouter();
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const formSchema = z.object({
    icon: z.string(),
    label: z.string().min(1),
    description: z.string().min(1),
    model: z.string(),
    prompt: z.string().min(1),
    cost: z.coerce.number().gt(0),
    token: z.string().length(42),
    chain: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      icon: undefined,
      label: "",
      description: "",
      model: undefined,
      prompt: "",
      cost: 5,
      token: "",
      chain: undefined,
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
      // Define contracts
      const contracts = chainToSiteConfigContracts(values.chain);

      // Parse values
      let cost = parseEther(String(values.cost));
      let token;
      if (!isAddress(values.token)) {
        throw new Error("Token address is incorrect");
      } else {
        token = values.token as `0x${string}`;
      }

      // Upload metadata to IPFS
      const metadata: AIAppMetadata = {
        icon: values.icon,
        label: values.label,
        description: values.description,
        model: values.model,
        prompt: values.prompt,
      };
      const metadataUri = await uploadJsonToIpfs(metadata);

      // Send request to create an ai app
      let createTxHash;
      if (contracts.accountAbstractionSuported) {
        createTxHash = await executeViaSmartAccount(
          address,
          contracts.aiApp,
          encodeFunctionData({
            abi: aiAppAbi,
            functionName: "create",
            args: [metadataUri],
          }),
          contracts
        );
      } else {
        createTxHash = await walletClient.writeContract({
          address: contracts.aiApp,
          abi: aiAppAbi,
          functionName: "create",
          args: [metadataUri],
          chain: contracts.chain,
        });
      }
      const createTxReceipt = await publicClient.waitForTransactionReceipt({
        hash: createTxHash as `0x${string}`,
      });
      const createTxLogs = parseEventLogs({
        abi: aiAppAbi,
        eventName: "Transfer",
        logs: createTxReceipt.logs,
      });
      const createdAIAppId = createTxLogs[0].args.tokenId;

      // Send request to set ai app params
      let setParamstxHash;
      if (contracts.accountAbstractionSuported) {
        setParamstxHash = await executeViaSmartAccount(
          address,
          contracts.aiApp,
          encodeFunctionData({
            abi: aiAppAbi,
            functionName: "setParams",
            args: [createdAIAppId, cost, token],
          }),
          contracts
        );
      } else {
        setParamstxHash = await walletClient.writeContract({
          address: contracts.aiApp,
          abi: aiAppAbi,
          functionName: "setParams",
          args: [createdAIAppId, cost, token],
          chain: contracts.chain,
        });
      }
      await publicClient.waitForTransactionReceipt({
        hash: setParamstxHash as `0x${string}`,
      });

      // Show success message
      toast({
        title: "AI app created 👌",
      });
      router.push("/dashboard");
    } catch (error: any) {
      handleError(error, true);
      setIsFormSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isFormSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an icon" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="🤖">🤖</SelectItem>
                  <SelectItem value="🪄">🪄</SelectItem>
                  <SelectItem value="✍️">✍️</SelectItem>
                  <SelectItem value="💼">💼</SelectItem>
                  <SelectItem value="🔮">🔮</SelectItem>
                  <SelectItem value="🎓">🎓</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl>
                <Input
                  placeholder="Code Copilot"
                  disabled={isFormSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Code Smarter, Build Faster..."
                  disabled={isFormSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isFormSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="GPT-3.5 Turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="GPT-4 Turbo" disabled>
                    GPT-4 Turbo
                  </SelectItem>
                  <SelectItem value="DALL·E" disabled>
                    DALL·E
                  </SelectItem>
                  <SelectItem value="Claude 3 Sonnet" disabled>
                    Claude 3 Sonnet
                  </SelectItem>
                  <SelectItem value="Claude 3 Opus" disabled>
                    Claude 3 Opus
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prompt</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="You are a bot called..."
                  disabled={isFormSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cost</FormLabel>
              <FormControl>
                <Input
                  placeholder="5"
                  type="number"
                  disabled={isFormSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="token"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Token</FormLabel>
              <FormControl>
                <Input
                  placeholder="0x0000000000000000000000000000000000000000"
                  disabled={isFormSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="chain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chain</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isFormSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a chain" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(siteConfig.contracts).map(
                    (contracts, index) => (
                      <SelectItem
                        key={index}
                        value={contracts.chain.id.toString()}
                      >
                        {contracts.chain.name}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isFormSubmitting}>
          {isFormSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Create
        </Button>
      </form>
    </Form>
  );
}
