"use client";

import Link from "next/link";
import { ArrowRight, Loader2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { type BaseError, useReadContract } from "wagmi";
import { Address } from "viem";
import { useState } from "react";

export default function AirdropErc20Card() {
  const [contractAddress, setContractAddress] = useState("");
  const { data: symbol, error, isPending } = useReadContract({
    functionName: "symbol",
    args: [contractAddress],
  });

  function handleContractAddressChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setContractAddress(event.target.value);
  }

  return (
    <div className="flex flex-row justify-between items-center shadow-lg w-full p-8 border-2 border-secondary hover:border-primary">
      <div className="flex flex-col gap-4">
        <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">
          Airdrop $KAIA
        </h2>
        <p>Add contract address to check before proceeding</p>
        <div className="flex flex-row gap-4 items-center">
          <Input
            type="text"
            placeholder="0x..."
            value={contractAddress}
            onChange={handleContractAddressChange}
          />
          {isPending && <Loader2 className="h-6 w-6 animate-spin text-yellow-500" />}
          {symbol ? (
            <p>
              <Check className="mr-2 h-4 w-4 text-green-500" />
              {symbol?.toString()}
            </p>
          ) : null}
        </div>
      </div>
      <ArrowRight className="w-8 h-8" />
    </div>
  );
}
