"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type BaseError,
  useWaitForTransactionReceipt,
  useWriteContract,
  useAccount,
  useReadContracts,
} from "wagmi";
import { parseEther } from "viem";
import { formatUnits } from "viem";
import { Loader2, Check, Plus, Info, Trash2 } from "lucide-react";
import { abi } from "./abi";
import { erc20Abi } from "./erc20-abi";
import { CONTRACT_ADDRESS_BAOBAB, CONTRACT_ADDRESS_CYPRESS } from "./contract";
import { useChainId } from "wagmi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AirdropItem = {
  address: string;
  amount: string;
};

type Address = `0x${string}`;

export function AirdropERC20() {
  const account = useAccount();
  // state for airdrop list using manual input
  const [airdropList, setAirdropList] = useState<AirdropItem[]>([]);
  const [totalAirdropAmount, setTotalAirdropAmount] = useState<bigint>(
    BigInt(0)
  );

  // get chainID to determine which contract to use
  const chainId = useChainId();
  const [erc20TokenAddress, setErc20TokenAddress] = useState<string>("");
  const [erc20TokenSymbol, setErc20TokenSymbol] = useState<string>("");
  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const {
    data: approveHash,
    error: approveError,
    isPending: approveIsPending,
    writeContract: approveWriteContract,
  } = useWriteContract();

  const {
    data: tokenInfoData,
    error: tokenInfoError,
    isPending: tokenInfoIsPending,
    isSuccess: tokenInfoSuccess,
  } = useReadContracts({
    contracts: [
      {
        abi: erc20Abi,
        functionName: "allowance",
        address: erc20TokenAddress
          ? (erc20TokenAddress as `0x${string}`)
          : undefined,
        args: [
          account.address as `0x${string}`,
          chainId === 1001 ? CONTRACT_ADDRESS_BAOBAB : CONTRACT_ADDRESS_CYPRESS,
        ],
      },
      {
        abi: erc20Abi,
        functionName: "symbol",
        address: erc20TokenAddress as `0x${string}`,
      },
      {
        abi: erc20Abi,
        functionName: "name",
        address: erc20TokenAddress as `0x${string}`,
      },
      {
        abi: erc20Abi,
        functionName: "decimals",
        address: erc20TokenAddress as `0x${string}`,
      },
    ],
  });

  useEffect(() => {
    if (tokenInfoSuccess) {
      setErc20TokenSymbol(tokenInfoData[1]?.result?.toString() ?? "");
    }
  }, [tokenInfoData, tokenInfoSuccess]);

  // state for file input
  const [file, setFile] = useState<File | undefined>(undefined);

  useEffect(() => {
    const fileReader = new FileReader();
    fileReader.onload = function (e: ProgressEvent<FileReader>) {
      if (e.target) {
        const text = e.target.result;
        csvFileToArray(text);
      }
    };
    if (file) {
      fileReader.readAsText(file);
    }
  }, [file]);

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
    }
  }

  // function to convert the csv file to airdropList
  function csvFileToArray(text: string | ArrayBuffer | null) {
    if (typeof text === "string") {
      const rows = text.split("\n").filter((item) => item !== "");
      const airdropList = rows.map((row) => {
        const [address, amount] = row.split(",");
        return { address, amount };
      });
      setAirdropList(airdropList);
    }
  }

  function handleAddAirdropList() {
    setAirdropList(airdropList.concat({ address: "", amount: "" }));
  }

  function handleResetAirdropList() {
    setAirdropList([]);
  }

  function handleAddressChange(index: number) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const newAirdropList = [...airdropList];
      newAirdropList[index].address = e.target.value;
      setAirdropList(newAirdropList);
    };
  }

  function handleAmountChange(index: number) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const newAirdropList = [...airdropList];
      newAirdropList[index].amount = e.target.value;
      setAirdropList(newAirdropList);
    };
  }

  // calculate total airdrop amount when airdropList changes
  useEffect(() => {
    const total = airdropList.reduce((acc, item) => {
      return acc + BigInt(parseEther(item.amount));
    }, BigInt(0));
    setTotalAirdropAmount(total);
  }, [airdropList]);

  function executeAirdrop() {
    // sanitize airdropList from any empty objects
    const airdropListFiltered = airdropList.filter(
      (item) => item.amount !== "" && item.address !== ""
    );

    // create addresses list
    const addresses: Address[] = airdropListFiltered.map(
      (item) => item.address.replace(/\s/g, "") as Address
    );

    // create airdropAmounts list
    const airdropAmounts: bigint[] = airdropListFiltered.map((item) =>
      parseEther(item.amount)
    );
    writeContract({
      abi,
      address:
        chainId === 1001 ? CONTRACT_ADDRESS_BAOBAB : CONTRACT_ADDRESS_CYPRESS,
      functionName: "airdropETH",
      args: [addresses, airdropAmounts],
      value: totalAirdropAmount,
    });
  }

  function truncateAddress(address: string) {
    return `${address.slice(0, 10)}...${address.slice(-10)}`;
  }

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

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed } =
    useWaitForTransactionReceipt({
      hash: approveHash,
    });

  return (
    <div className="flex flex-col gap-12 w-[768px]">
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
      <div className="flex flex-col gap-4">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Step 1
        </h2>
        <div className="flex flex-row gap-2 items-center">
          <Info className="h-4 w-4" />
          <p>Create an airdrop list</p>
        </div>
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual</TabsTrigger>
            <TabsTrigger value="file-input">File</TabsTrigger>
          </TabsList>
          <TabsContent value="manual" className="flex flex-col gap-4">
            <p>
              <span className="inline-block mr-2">
                <Info className="h-4 w-4" />
              </span>
              Input addresses and corresponding amounts manually. Best for
              airdropping to small amount of addreses
            </p>
            {
              // if airdropList is empty, show the message
              airdropList.length === 0 ? (
                <p className="text-md text-muted-foreground">
                  No addresses added. Click the + button below to add.
                </p>
              ) : (
                // if airdropList is not empty, show the list
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <h2>Addresses</h2>
                    <h2>Amounts</h2>
                  </div>
                  {airdropList.map((item, index) => (
                    <div key={index} className="flex flex-row gap-4">
                      <Input
                        placeholder="Enter an address"
                        value={item.address}
                        onChange={handleAddressChange(index)}
                      />
                      <Input
                        placeholder="Enter an amount"
                        value={item.amount}
                        onChange={handleAmountChange(index)}
                      />
                    </div>
                  ))}
                </div>
              )
            }
            <div className="flex flex-row gap-2">
              <Button
                onClick={handleAddAirdropList}
                variant="outline"
                size="icon"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleResetAirdropList}
                variant="outline"
                size="icon"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
          <TabsContent className="flex flex-col gap-4" value="file-input">
            <p>
              <span className="inline-block mr-2">
                <Info className="h-4 w-4" />
              </span>
              Upload a .csv file containing addresses and amounts.
            </p>
            <Input
              type="file"
              accept=".csv"
              onChange={handleImportFile}
              className="w-full"
            />
            {
              // if airdropList is empty, show the message
              airdropList.length === 0 ? (
                <p className="text-md text-muted-foreground">
                  No addresses uploaded.
                </p>
              ) : (
                // if airdropList is not empty, show the list
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <h2>Addresses</h2>
                    <h2>Amounts</h2>
                  </div>
                  {airdropList.map((item, index) => (
                    <div key={index} className="flex flex-row gap-4">
                      <Input
                        placeholder="Enter an address"
                        value={item.address}
                        readOnly
                      />
                      <Input
                        placeholder="Enter an amount"
                        value={item.amount}
                        readOnly
                      />
                    </div>
                  ))}
                </div>
              )
            }
          </TabsContent>
        </Tabs>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Step 2
        </h2>
        <div className="flex flex-row gap-2 items-center">
          <Info className="h-4 w-4" />
          <p>Add the token address to check for information</p>
        </div>
        <div className="flex flex-col gap-3">
          <Input
            name="tokenAddress"
            type="text"
            placeholder="Paste address of the token here"
            value={erc20TokenAddress}
            onChange={(e) => setErc20TokenAddress(e.target.value)}
          />
        </div>
        {tokenInfoData ? (
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-4 items-center">
              <div className="bg-gray-300 rounded-full h-12 w-12 flex justify-center items-center">
                <p>{tokenInfoData[1]?.result?.toString().charAt(0)}</p>
              </div>
              <div className="flex flex-col">
                <p className="font-semibold text-lg">
                  {tokenInfoData[2]?.result?.toString()}
                </p>
                <p className="font-mono text-sm">
                  {tokenInfoData[1]?.result?.toString()}
                </p>
              </div>
            </div>
            <p>
              Approval amount:{" "}
              {formatUnits(
                BigInt(tokenInfoData[0]?.result ?? 0),
                tokenInfoData[3]?.result ?? 0
              )}
            </p>
          </div>
        ) : (
          <p className="mt-4">No results found.</p>
        )}
      </div>
    </div>
  );
}
