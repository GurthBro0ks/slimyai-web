import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, BarChart3, MessageSquare, Shield, Image, Calculator, FileText, Zap } from "lucide-react";

export default function FeaturesPage() {
  const features = [
    {
      icon: Bot,
      title: "Snail Tools",
      description: "Comprehensive toolkit for Super Snail players",
      items: [
        "Screenshot analysis with GPT-4 Vision",
        "Tier cost calculator",
        "Secret codes aggregator (Snelp + Reddit)",
        "Stats tracking and history",
      ],
    },
    {
      icon: BarChart3,
      title: "Club Analytics",
      description: "Advanced analytics for club management",
      items: [
        "Member performance tracking",
        "Upload and analyze club screenshots",
        "Historical stats comparison",
        "Export data to Google Sheets",
      ],
    },
    {
      icon: MessageSquare,
      title: "Slime Chat",
      description: "AI-powered conversational assistant",
      items: [
        "4 personality modes (mentor, partner, mirror, operator)",
        "Context-aware responses",
        "Memory system with tagging",
        "Catchphrase rotation",
      ],
    },
    {
      icon: Shield,
      title: "Admin Panel",
      description: "Powerful management tools for admins",
      items: [
        "Multi-guild management",
        "Role-based access control",
        "Bot health diagnostics",
        "Configuration management",
      ],
    },
    {
      icon: Image,
      title: "Image Generation",
      description: "AI-powered image creation",
      items: [
        "10 artistic styles (anime, watercolor, 3D, pixel art, etc.)",
        "DALL-E 3 integration",
        "Database logging for analytics",
        "Rate limiting and error handling",
      ],
    },
    {
      icon: FileText,
      title: "Memory System",
      description: "Persistent memory and context",
      items: [
        "Server-wide consent management",
        "Tag-based organization",
        "Context tracking (channel, timestamp)",
        "Export as JSON",
      ],
    },
    {
      icon: Calculator,
      title: "Cost Calculator",
      description: "Calculate upgrade costs",
      items: [
        "Tier cost calculations",
        "Resource optimization",
        "Progress tracking",
        "Historical cost analysis",
      ],
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Stay up-to-date with the latest",
      items: [
        "Live API integration",
        "Automatic code updates",
        "Health monitoring",
        "Performance metrics",
      ],
    },
  ];

  return (
    <div className="container px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Features
          </h1>
          <p className="text-xl text-muted-foreground">
            Everything you need to enhance your Super Snail experience
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title} className="border-neon-green/20">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <feature.icon className="h-8 w-8 text-neon-green" />
                  <div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feature.items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-neon-green">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
