import { AirdropERC20 } from '@/components/airdrop-erc20';
import { AirdropERC721 } from '@/components/airdrop-erc721';
import { AirdropKlay } from '@/components/airdrop-klay';
import Credits from '@/components/credits';
import MobileWarning from '@/components/mobile-warning';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Home() {

  return (
    <main className="flex flex-col gap-8 items-center justify-center py-12 px-4 lg:p-36">
      <div className="hidden lg:flex lg:flex-col lg:gap-12 max-w-3xl">
        <ConnectButton />
        <AirdropKlay />
        <AirdropERC20 />
        <AirdropERC721 />
        <Credits />
      </div>
      <MobileWarning />
    </main>
  );
}