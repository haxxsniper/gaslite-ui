"use client";

import { useState, useEffect } from "react";
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
  useAccount,
  useReadContract,
  useReadContracts
} from "wagmi";
import { parseEther } from "viem";
import { formatUnits } from "viem";
// import { serialize } from "wagmi";
// import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check } from "lucide-react";
import { abi } from "./abi";
import { erc20Abi } from "./erc20-abi";
import { CONTRACT_ADDRESS_BAOBAB, CONTRACT_ADDRESS_CYPRESS } from "./contract";
import { useChainId } from 'wagmi'
import { Label } from "./ui/label";


export function AirdropERC20() {
  const { toast } = useToast();
  const account = useAccount()
  const chainId = useChainId()
  const [erc20TokenAddress, setErc20TokenAddress] = useState<string>("");
  const [erc20TokenSymbol, setErc20TokenSymbol] = useState<string>("");
  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const { data: approveHash, error: approveError, isPending: approveIsPending, writeContract: approveWriteContract } = useWriteContract();

  const { 
    data: tokenInfoData,
    error: tokenInfoError,
    isPending: tokenInfoIsPending,
    isSuccess: tokenInfoSuccess,
  } = useReadContracts({
    contracts: [{
        abi: erc20Abi,
        functionName: 'allowance',
        address: erc20TokenAddress ? erc20TokenAddress as `0x${string}` : undefined,
        args: [account.address as `0x${string}`, chainId === 1001 ? CONTRACT_ADDRESS_BAOBAB : CONTRACT_ADDRESS_CYPRESS],
      }, {
        abi: erc20Abi,
        functionName: 'symbol',
        address: erc20TokenAddress as `0x${string}`,
      }, {
        abi: erc20Abi,
        functionName: 'name',
        address: erc20TokenAddress as `0x${string}`,
      }, {
        abi: erc20Abi,
        functionName: 'decimals',
        address: erc20TokenAddress as `0x${string}`,
      }
    ],
  });

  useEffect(() => {
    if (tokenInfoSuccess) {
      setErc20TokenSymbol(tokenInfoData[1]?.result?.toString() ?? "")
    }
  }, [tokenInfoData, tokenInfoSuccess])



  useEffect(() => {
    if (error) { 
      toast({
        variant: "destructive",
        title: "Transaction reverted",
        description: `${(error as BaseError).shortMessage || error.message}`,
      });
    }
  }, [error, toast])

  // 2. Define a submit handler.
  // function onSubmit(values: z.infer<typeof formSchema>) {
  //   const tokenAddress: (`0x${string}`) = erc20TokenAddress as `0x${string}`;
  //   const totalAirdropAmount: bigint = parseEther(values.totalAirdropAmount.toString());
  //   const addresses: (`0x${string}`)[] = values.addresses.split(",").map((address) => address.replace(/\s/g, "") as `0x${string}`);
  //   const airdropAmounts: bigint[] = values.airdropAmounts.split(",").map((amount) => parseEther(amount));
  //   writeContract({
  //     abi: abi,
  //     address: chainId === 1001 ? CONTRACT_ADDRESS_BAOBAB : CONTRACT_ADDRESS_CYPRESS,
  //     functionName: 'airdropERC20',
  //     args: [tokenAddress, addresses, airdropAmounts, totalAirdropAmount]
  //   })

  // }

  // function onApprove(values: z.infer<typeof setAllowanceFormSchema>) {
  //   const amount: bigint = parseEther(values.amount.toString());
  //   approveWriteContract({
  //     abi: erc20Abi,
  //     address: erc20TokenAddress as `0x${string}`,
  //     functionName: 'approve',
  //     args: [chainId === 1001 ? CONTRACT_ADDRESS_BAOBAB : CONTRACT_ADDRESS_CYPRESS, amount]
  //   })
  // }


  function truncateAddress(address: string) {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  }

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed } =
    useWaitForTransactionReceipt({
      hash: approveHash,
    });

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-6">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Airdrop ERC20 on{" "}
          <a
            className="underline underline-offset-4 text-blue-500"
            href="https://coinmarketcap.com/currencies/klaytn/"
            target="_blank"
          >
            KAIA
          </a>
        </h1>
        <p>Airdrop ERC20 tokens to multiple addresses at once.</p>
      </div>
    </div>
  );
}
