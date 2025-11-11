import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ClientPage from "./ClientPage";
import { isExperimentEnabled } from "@/lib/feature-flags";
import { getMockRawStats, scrubStats } from "@/lib/stats-scrubber";

const MOCK_GUILD_NAME = "The Snail Club";

export async function generateMetadata({
  params,
}: {
  params: { guildId: string };
}): Promise<Metadata> {
  const guildId = params.guildId;

  return {
    title: `Slimy.ai — Public Stats ${guildId}`,
    openGraph: { title: `Slimy.ai — Public Stats ${guildId}` },
  };
}

export default function Page({ params }: { params: { guildId: string } }) {
  const guildId = params.guildId;
  const isEnabled = isExperimentEnabled(guildId, "publicStats");

  if (!isEnabled) {
    notFound();
  }

  const rawStats = getMockRawStats(guildId, MOCK_GUILD_NAME);
  const scrubbedStats = scrubStats(rawStats);

  return (
    <ClientPage guildId={guildId} guildName={MOCK_GUILD_NAME} scrubbedStats={scrubbedStats} />
  );
}
