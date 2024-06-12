import AirdropErc20Card from "@/components/airdrop-erc20-card";
import AirdropKaiaCard from "@/components/airdrop-kaia-card";

export default function Home() {
  return (
    <div className="text-left w-[768px]">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">Airdrop</h1>
      <p className="leading-7 [&:not(:first-child)]:mt-6">A simple tool to airdrop on Kaia chain</p>
      <div className="flex flex-col gap-4">
        <AirdropKaiaCard />
        <AirdropErc20Card />
      </div>
    </div>
  );
}