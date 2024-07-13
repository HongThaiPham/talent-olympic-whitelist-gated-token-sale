import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center space-y-10 p-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <Image
        src={"/talent-olympics.svg"}
        width={192}
        height={186.55}
        alt="talent olympics"
      />
      <div className="flex gap-4">
        <Button asChild>
          <Link href="https://dial.to/?action=solana-action:https://solactions.leopham.app/api/actions/init-pool">
            Action Init pool
          </Link>
        </Button>
        <Button asChild>
          <Link href="https://dial.to/?action=solana-action:https://solactions.leopham.app/api/actions/join-whitelist/HA8A2ptCRimGz7dyb5y3YJnGV9qZX6zAhEiWLoQDXhPU">
            Action join whitelist
          </Link>
        </Button>
      </div>
    </main>
  );
}
