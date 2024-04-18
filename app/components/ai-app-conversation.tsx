"use client";

import useError from "@/hooks/useError";
import { sendMessagesToOpenAI } from "@/lib/actions";
import { addressToShortAddress } from "@/lib/converters";
import { OpenAiMessage } from "@/types/open-ai-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAccount } from "wagmi";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Input } from "./ui/input";

export function AIAppConversation(props: {
  aiAppIcon: string | undefined;
  aiAppLabel: string | undefined;
  aiAppModel: string | undefined;
  aiAppPrompt: string | undefined;
}) {
  const { handleError } = useError();
  const [messages, setMessages] = useState<OpenAiMessage[]>(
    props.aiAppPrompt ? [{ role: "system", content: props.aiAppPrompt }] : []
  );
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const formSchema = z.object({
    message: z.string().min(1),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsFormSubmitting(true);
      if (
        props.aiAppModel === "gpt-3.5-turbo" ||
        props.aiAppModel === "GPT-3.5 Turbo"
      ) {
        const msgs: OpenAiMessage[] = [
          ...messages,
          { role: "user", content: values.message },
        ];
        setMessages(msgs);
        const answer = await sendMessagesToOpenAI(msgs, "gpt-3.5-turbo", 0.7);
        console.log("answer", answer);
        msgs.push({ role: "assistant", content: answer });
        setMessages(msgs);
        form.reset();
      } else {
        throw new Error(`Model '${props.aiAppModel}' is not supported`);
      }
    } catch (error: any) {
      handleError(error, true);
    } finally {
      setIsFormSubmitting(false);
    }
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full flex flex-row gap-2"
        >
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input
                    placeholder="Message..."
                    disabled={isFormSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isFormSubmitting}>
            {!isFormSubmitting && <Send className="mr-2 h-4 w-4" />}
            {isFormSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Send
          </Button>
        </form>
      </Form>
      <div className="flex flex-col gap-8 mt-8">
        {messages.toReversed().map((message, index) => (
          <AIAppConversationMessage
            key={index}
            aiAppIcon={props.aiAppIcon}
            aiAppLabel={props.aiAppLabel}
            message={message}
          />
        ))}
      </div>
    </>
  );
}

function AIAppConversationMessage(props: {
  aiAppIcon: string | undefined;
  aiAppLabel: string | undefined;
  message: OpenAiMessage;
}) {
  const { address } = useAccount();

  if (props.message.role === "system") {
    return null;
  }

  return (
    <div className="w-full flex flex-row gap-4">
      {/* Icon */}
      <div>
        <Avatar className="size-12">
          <AvatarImage src="" alt="Icon" />
          {props.message.role === "assistant" ? (
            <AvatarFallback className="text-base bg-primary">
              {props.aiAppIcon || "🤖"}
            </AvatarFallback>
          ) : (
            <AvatarFallback className="text-base bg-secondary-foreground">
              🧠
            </AvatarFallback>
          )}
        </Avatar>
      </div>
      {/* Content */}
      <div className="w-full">
        <p className="text-sm font-bold">
          {props.message.role === "assistant"
            ? props.aiAppLabel
            : addressToShortAddress(address)}
        </p>
        <p className="text-sm mt-0.5 whitespace-pre-line">
          {props.message.content}
        </p>
      </div>
    </div>
  );
}
