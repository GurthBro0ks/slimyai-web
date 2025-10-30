import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const adminApiBase = process.env.NEXT_PUBLIC_ADMIN_API_BASE;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="mx-auto max-w-2xl text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Image 
            src="/images/logo.svg" 
            alt="Slimy.ai Logo" 
            width={180} 
            height={180}
            className="w-36 h-36 sm:w-44 sm:h-44"
          />
        </div>

        {/* Main Heading */}
        <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl">
          <span className="bg-gradient-to-r from-blue-400 to-neon-green bg-clip-text text-transparent">
            Panel of Power
          </span>
        </h1>

        {/* Tagline */}
        <p className="mb-10 text-lg text-muted-foreground sm:text-xl">
          fueled by <span className="text-purple">adhd</span> — driven by <span className="text-neon-green">feet</span> — motivated by <span className="text-blue-400">ducks</span>
        </p>

        {/* CTA Button */}
        <Link href={adminApiBase ? `${adminApiBase}/api/auth/login` : "#"}>
          <Button variant="purple" size="lg" className="text-lg px-12 py-6 h-auto rounded-full">
            Login with Discord
          </Button>
        </Link>
      </div>
    </div>
  );
}
