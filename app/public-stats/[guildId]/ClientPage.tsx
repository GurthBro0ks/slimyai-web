'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScrubbedStat } from "@/lib/stats-scrubber";

type ClientPageProps = {
  guildId: string;
  guildName: string;
  scrubbedStats: ScrubbedStat[];
};

export default function ClientPage({
  guildId,
  guildName,
  scrubbedStats,
}: ClientPageProps) {
  const totalValue = scrubbedStats.reduce((sum, stat) => sum + stat.value, 0);
  const lastUpdate = scrubbedStats.reduce((latest, stat) => {
    return stat.date > latest ? stat.date : latest;
  }, "N/A");

  return (
    <div className="container px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-4xl font-bold">{guildName} Public Stats</h1>
        <p className="text-muted-foreground mb-2 text-sm">Guild ID: {guildId}</p>
        <p className="text-muted-foreground mb-8">
          Read-only, PII-scrubbed metrics. Last updated: {lastUpdate}
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Metric Value</CardTitle>
              <Badge variant="neon">SCRUBBED</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Sum of all tracked values</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Member Count</CardTitle>
              <Badge variant="secondary">SCRUBBED</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scrubbedStats.length}</div>
              <p className="text-xs text-muted-foreground">Total members tracked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Latest Value</CardTitle>
              <Badge variant="outline">SCRUBBED</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {scrubbedStats[scrubbedStats.length - 1]?.value.toLocaleString() || "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                From {scrubbedStats[scrubbedStats.length - 1]?.date || "N/A"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Metric Breakdown (PII Scrubbed)</h2>
          <div className="space-y-2">
            {scrubbedStats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="font-mono text-sm">Member {index + 1}</div>
                  <div className="text-lg font-semibold">{stat.value.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">{stat.date}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
