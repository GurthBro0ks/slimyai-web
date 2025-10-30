import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Image, BarChart3, Code, HelpCircle, Calculator, Clock } from "lucide-react";
import { SnailTimeline } from "@/components/snail-timeline";

export default function SnailPage() {
  const tools = [
    {
      icon: Code,
      title: "Secret Codes",
      description: "Access all active codes aggregated from Snelp and Reddit",
      href: "/snail/codes",
      available: true,
    },
    {
      icon: Image,
      title: "Analyze Screenshot",
      description: "Upload Super Snail screenshots for AI-powered analysis",
      href: "/snail/analyze",
      available: false,
    },
    {
      icon: BarChart3,
      title: "Stats Tracking",
      description: "View your historical stats and progress over time",
      href: "/snail/stats",
      available: false,
    },
    {
      icon: Calculator,
      title: "Tier Calculator",
      description: "Calculate upgrade costs and resource requirements",
      href: "/snail/calc",
      available: false,
    },
    {
      icon: HelpCircle,
      title: "Help & Guides",
      description: "Tips, tricks, and guides for Super Snail",
      href: "/snail/help",
      available: false,
    },
  ];

  return (
    <div className="container px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Snail Dashboard</h1>
          <p className="text-muted-foreground">
            Your personalized Super Snail command center
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Clock className="h-6 w-6 mr-2 text-neon-green" />
              Snail Timeline
            </h2>
            <Card className="p-6 h-[500px] overflow-y-auto">
              <SnailTimeline />
            </Card>
          </div>

          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold mb-4">Quick Tools</h2>
            <Callout variant="warn" className="mb-4">
              Connect Admin API to enable all features. Some tools are currently in development.
            </Callout>

            <div className="grid gap-6">
              {tools.map((tool) => (
                <Card
                  key={tool.title}
                  className={
                    tool.available
                      ? "border-neon-green/20 hover:border-neon-green/50 transition-colors"
                      : "opacity-60"
                  }
                >
                  <CardHeader>
                    <tool.icon className="h-10 w-10 text-neon-green mb-2" />
                    <CardTitle>{tool.title}</CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {tool.available ? (
                      <Link href={tool.href}>
                        <Button variant="neon" className="w-full">
                          Open Tool
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        Coming Soon
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
