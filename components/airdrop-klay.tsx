"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { array, z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  type BaseError,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { parseEther } from "viem";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check } from "lucide-react";
import { abi } from "./abi";
import { CONTRACT_ADDRESS_BAOBAB, CONTRACT_ADDRESS_CYPRESS } from "./contract";
import { useChainId } from "wagmi";

const formSchema = z.object({
  amount: z.coerce
    .number({
      required_error: "Amount is required",
      invalid_type_error: "Amount must be a number",
    })
    .positive({ message: "Amount must be positive" }),
  addresses: z.string(),
  airdropAmounts: z.string(),
});

export function AirdropKlay() {
  const { toast } = useToast();
  const chainId = useChainId();
  const { data: hash, error, isPending, writeContract } = useWriteContract();
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    const addresses: `0x${string}`[] = values.addresses
      .split(",")
      .map((address) => address.replace(/\s/g, "") as `0x${string}`);
    const airdropAmounts: bigint[] = values.airdropAmounts
      .split(",")
      .map((amount) => parseEther(amount));
    writeContract({
      abi,
      address:
        chainId === 1001 ? CONTRACT_ADDRESS_BAOBAB : CONTRACT_ADDRESS_CYPRESS,
      functionName: "airdropETH",
      args: [addresses, airdropAmounts],
      value: parseEther(values.amount.toString()),
    });
    if (error) {
      toast({
        variant: "destructive",
        title: "Transaction reverted",
        description: `${(error as BaseError).shortMessage.split(":")[1]}`,
      });
    }
  }

  function truncateAddress(address: string) {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  }

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  return (
    <div>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Airdrop <a className="underline underline-offset-4 text-blue-500" href="https://coinmarketcap.com/currencies/klaytn/" target="_blank">$KAIA</a>
      </h1>
      <p>
        Airdrop $KAIA to multiple addresses at once.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter an amount in KLAY"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormDescription>
                  You will send to the contract with this amount then the
                  contract will airdrop.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="addresses"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Addresses</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter addresses separating with comma (,)"
                    type="text"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormDescription>
                  You will enter your addresses in the following format
                  0x1234,0x5678,0x90ab
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="airdropAmounts"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter amounts"
                    type="text"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormDescription>
                  You will enter the corresponding airdrop amounts in the
                  following format 2, 3, 4.5
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {isPending ? (
            <Button disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </Button>
          ) : (
            <Button type="submit">Airdrop KLAY</Button>
          )}
        </form>
      </Form>
      <h3 className="scroll-m-20 text-lg font-semibold tracking-tight">
        Transaction status
      </h3>
      {hash ? (
        <div className="flex flex-row gap-2">
          Hash:
          <a
            target="_blank"
            className="text-blue-500 underline"
            href={
              chainId === 1001
                ? `https://baobab.klaytnfinder.io/tx/${hash}`
                : `https://klaytnfinder.io/tx/${hash}`
            }
          >
            {truncateAddress(hash)}
          </a>
        </div>
      ) : (
        <>
          <div className="flex flex-row gap-2">
            Hash: no transaction hash until after submission
          </div>
          <Badge variant="outline">No transaction yet</Badge>
        </>
      )}
      {isConfirming && (
        <Badge variant="secondary">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Waiting for confirmation...
        </Badge>
      )}
      {isConfirmed && (
        <Badge className="flex flex-row items-center bg-green-500 cursor-pointer">
          <Check className="mr-2 h-4 w-4" />
          Transaction confirmed!
        </Badge>
      )}
    </div>
  );
}
