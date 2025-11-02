import type { ComponentType, SVGProps } from "react";
import { Bot, BarChart3, MessageSquare, Shield, Image, Calculator, FileText, Zap, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

const featurePalette: Record<string, string> = {
  chat: "from-emerald-500/90 via-emerald-400/80 to-emerald-600/70",
  analytics: "from-cyan-500/80 via-sky-400/70 to-emerald-500/60",
  automations: "from-purple-500/80 via-pink-500/70 to-amber-400/70",
  command: "from-emerald-500/70 via-lime-400/70 to-amber-300/70",
};

interface Feature {
  title: string;
  description: string;
  items: string[];
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  theme: keyof typeof featurePalette;
  status?: "live" | "beta" | "preview";
}

export default function FeaturesPage() {
  const slimeChatFlag = process.env.ENABLE_SLIME_CHAT ?? process.env.NEXT_PUBLIC_ENABLE_SLIME_CHAT;
  const analyticsFlag = process.env.ENABLE_CLUB_ANALYTICS ?? process.env.NEXT_PUBLIC_ENABLE_CLUB_ANALYTICS;
  const sheetsFlag = process.env.ENABLE_GOOGLE_SHEETS_EXPORT ?? process.env.NEXT_PUBLIC_ENABLE_GOOGLE_SHEETS_EXPORT;

  const enableSlimeChat = slimeChatFlag?.toLowerCase() === "true";
  const enableClubAnalytics = analyticsFlag?.toLowerCase() === "true";
  const enableSheets = sheetsFlag?.toLowerCase() === "true";

  const featureHighlights: Feature[] = [
    {
      title: "Slime Chat Personalities",
      description: "Emerald-grade copilots with distinct personalities and memory.",
      items: [
        "Mentor, Partner, Mirror, and Operator modes",
        "Adaptive memory tagging with channel context",
        "Live event awareness (codes, rotations, snail news)",
        "Discord-ready responses with catchphrase rotation",
      ],
      icon: MessageSquare,
      theme: "chat",
      status: enableSlimeChat ? "live" : "beta",
    },
    {
      title: "Club Analytics Control Center",
      description: "Upload, analyze, and export your club data in seconds.",
      items: [
        "Screenshot ingestion pipeline with OCR and GPT-4 Vision",
        "Members-by-role insights and contribution heatmaps",
        "Export cleaned data straight to Google Sheets",
        "Scheduled reports for officers and captains",
      ],
      icon: BarChart3,
      theme: "analytics",
      status: enableClubAnalytics ? "live" : "preview",
    },
    {
      title: "Memory & Knowledge Vault",
      description: "Persistent knowledge graph to keep your guild aligned.",
      items: [
        "Consent-first memory storage with expiration controls",
        "Tag-based search by event, guild, or personality",
        "Structured exports (JSON/CSV) for compliance",
        "Relationship mapping between players, codes, and drops",
      ],
      icon: FileText,
      theme: "automations",
      status: "live",
    },
    {
      title: "Admin Automations",
      description: "Streamline moderation, scheduling, and raid planning.",
      items: [
        "Role-based dashboards with instant guild switching",
        "Automated reminders and recruitment funnel tools",
        "Health, latency, and quota diagnostics in one panel",
        "Dynamic rules engine powered by MCP tools",
      ],
      icon: Shield,
      theme: "command",
      status: "live",
    },
  ];

  const auxiliaryFeatures: Feature[] = [
    {
      title: "Snail Tools Suite",
      description: "Meta-ready calculations, timelines, and loot optimizers.",
      items: [
        "Tier cost calculators with delta projections",
        "Screenshot analysis with GPT-4 Vision",
        "Secret code aggregation from Snelp, Reddit, and Discord",
        "Session history with growth tracking",
      ],
      icon: Bot,
      theme: "command",
      status: "live",
    },
    {
      title: "Image + Media Generation",
      description: "Premium snail art for announcements and social drops.",
      items: [
        "10+ curated styles (anime, pixel, watercolor, mythic)",
        "Prompt templating for officers and streamers",
        "DALL·E 3 and Slimy diffusion backends",
        "Usage logs with quota governance",
      ],
      icon: Image,
      theme: "automations",
      status: "beta",
    },
    {
      title: "Club Data Exports",
      description: "Seamless integrations with spreadsheets and archives.",
      items: [
        "Google Sheets sync with column mapping",
        "MySQL mirror with chat and analytics tables",
        "CSV/JSON exports and archive retention policies",
        "Snapshot webhooks for third-party dashboards",
      ],
      icon: Radio,
      theme: "analytics",
      status: enableSheets ? "live" : "preview",
    },
    {
      title: "Real-time Updates",
      description: "Always-on monitors for events, rankings, and patch notes.",
      items: [
        "Live API integrations with automated rollbacks",
        "Performance and uptime monitors",
        "Rate limiting, retries, and circuit breakers",
        "Global notification routing with MCP",
      ],
      icon: Zap,
      theme: "chat",
      status: "live",
    },
    {
      title: "Resource Calculators",
      description: "Plan upgrades with precision and share outcomes instantly.",
      items: [
        "Tier + rarity calculators with cost projections",
        "Custom presets for club goals",
        "What-if scenarios with resource balancing",
        "Exportable plans for Discord announcements",
      ],
      icon: Calculator,
      theme: "command",
      status: "live",
    },
  ];

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#050505] via-[#060709] to-[#0b1410]" />
      <div className="container relative px-4 py-16 sm:py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <span className="mb-4 inline-flex rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Feature matrix
          </span>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-emerald-100 sm:text-5xl">
            Everything your club needs to stay ahead
          </h1>
          <p className="max-w-3xl text-lg text-zinc-400 sm:text-xl">
            Slimy.ai blends Discord-native automations with MCP-powered copilots. Surfacing insights, unlocking new strategies, and keeping your snailverse organized in real time.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            {featureHighlights.map((feature) => (
              <article
                key={feature.title}
                className={cn(
                  "group relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-[#101215]/90 p-8 shadow-[0_0_24px_rgba(16,185,129,0.22)] transition duration-300",
                  "hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(16,185,129,0.35)]"
                )}
              >
                <div
                  className={cn(
                    "absolute inset-0 -z-10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-60",
                    `bg-gradient-to-br ${featurePalette[feature.theme]}`
                  )}
                />
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-emerald-200">
                    <feature.icon className="h-8 w-8" />
                    <h2 className="text-2xl font-semibold">{feature.title}</h2>
                  </div>
                  {feature.status && (
                    <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase text-emerald-200">
                      {feature.status}
                    </span>
                  )}
                </div>
                <p className="mb-6 text-sm text-zinc-400">{feature.description}</p>
                <ul className="grid gap-2 text-sm text-zinc-200 sm:grid-cols-2">
                  {feature.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 rounded-xl bg-emerald-500/5 px-3 py-2 text-left text-emerald-100 transition group-hover:bg-emerald-500/10"
                    >
                      <span className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="space-y-6">
            {auxiliaryFeatures.map((feature) => (
              <article
                key={feature.title}
                className="rounded-3xl border border-emerald-500/15 bg-[#090b0f]/90 p-6 shadow-[0_0_18px_rgba(16,185,129,0.18)] transition hover:-translate-y-1 hover:shadow-[0_0_28px_rgba(16,185,129,0.28)]"
              >
                <div className="mb-5 flex items-center justify-between text-emerald-200">
                  <div className="flex items-center gap-3">
                    <feature.icon className="h-6 w-6" />
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                  </div>
                  {feature.status && (
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-200">
                      {feature.status}
                    </span>
                  )}
                </div>
                <p className="mb-4 text-xs text-zinc-400">{feature.description}</p>
                <ul className="space-y-2 text-xs text-zinc-200">
                  {feature.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
