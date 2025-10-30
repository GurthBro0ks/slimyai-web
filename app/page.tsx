import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Calculator, BarChart3, MessageSquare, Shield } from "lucide-react";

export default function HomePage() {
  const adminApiBase = process.env.NEXT_PUBLIC_ADMIN_API_BASE;

  const features = [
    {
      icon: Bot,
      title: "Snail Tools",
      description: "Analyze screenshots, calculate tier costs, and access secret codes for Super Snail.",
    },
    {
      icon: BarChart3,
      title: "Club Analytics",
      description: "Track club performance, analyze member stats, and optimize strategies.",
    },
    {
      icon: MessageSquare,
      title: "Slime Chat",
      description: "AI-powered conversations with personality modes and context awareness.",
    },
    {
      icon: Shield,
      title: "Admin Panel",
      description: "Manage guilds, configure settings, and monitor bot health.",
    },
  ];

  return (
    <div className="container px-4 py-16">
      {/* Hero Section - Compact */}
      <section className="mx-auto max-w-2xl text-center mb-24">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <Image 
            src="/images/logo.svg" 
            alt="Slimy.ai Logo" 
            width={100} 
            height={100}
            className="w-20 h-20 sm:w-24 sm:h-24"
          />
        </div>

        {/* Main Heading */}
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          <span className="text-neon-green">slimy.ai</span> - <span className="bg-gradient-to-r from-blue-400 to-neon-green bg-clip-text text-transparent">Panel of Power</span>
        </h1>

        {/* Tagline */}
        <p className="mb-8 text-base text-muted-foreground sm:text-lg">
          fueled by <span className="text-purple">adhd</span> — driven by <span className="text-neon-green">feet</span> — motivated by <span className="text-blue-400">ducks</span>
        </p>

        {/* CTA Button */}
        <Link href={adminApiBase ? `${adminApiBase}/api/auth/login` : "#"}>
          <Button variant="purple" size="lg" className="rounded-full">
            Login with Discord
          </Button>
        </Link>
      </section>

      {/* Features Grid */}
      <section className="mx-auto mt-24 max-w-6xl">
        <h2 className="mb-12 text-center text-3xl font-bold">Powerful Features</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="border-neon-green/20 hover:border-neon-green/50 transition-colors">
              <CardHeader>
                <feature.icon className="h-10 w-10 text-neon-green mb-2" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto mt-24 max-w-4xl rounded-lg border border-neon-green/20 bg-card p-12 text-center">
        <div className="mb-8 flex justify-center">
          <Image 
            src="/images/logo.svg" 
            alt="Slimy.ai Logo" 
            width={150} 
            height={150}
            className="w-32 h-32 sm:w-36 sm:h-36"
          />
        </div>
        <h2 className="mb-4 text-3xl font-bold">Ready to get started?</h2>
        <p className="mb-6 text-muted-foreground">
          Join thousands of Super Snail players using Slimy.ai to level up their game.
        </p>
        <Link href={adminApiBase ? `${adminApiBase}/api/auth/login` : "#"}>
          <Button variant="neon" size="lg">
            Get Started Now
          </Button>
        </Link>
      </section>
    </div>
  );
}
