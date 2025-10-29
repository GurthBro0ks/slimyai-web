import Link from "next/link";
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
      {/* Hero Section */}
      <section className="mx-auto max-w-4xl text-center">
        <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl">
          Meet <span className="text-neon-green">Slimy.ai</span>
        </h1>
        <p className="mb-8 text-xl text-muted-foreground">
          Your AI-powered Discord companion for Super Snail analysis, club management, and intelligent conversations.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href={adminApiBase ? `${adminApiBase}/api/auth/login` : "#"}>
            <Button variant="neon" size="lg">
              Login with Discord
            </Button>
          </Link>
          <Link href="/features">
            <Button variant="outline" size="lg">
              Explore Features
            </Button>
          </Link>
        </div>
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
