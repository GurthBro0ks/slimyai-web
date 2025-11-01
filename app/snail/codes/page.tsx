"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyBox } from "@/components/ui/copy-box";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Callout } from "@/components/ui/callout";
import { RefreshCw, Search, Flag, Info } from "lucide-react";

interface CodeSource {
  site: string;
  url?: string;
  post_id?: string;
  confidence: number;
  fetched_at: string;
}

interface Code {
  code: string;
  title?: string;
  description?: string;
  rewards?: string[];
  region?: string;
  expires_at?: string | null;
  first_seen_at: string;
  last_seen_at: string;
  sources: CodeSource[];
  verified: boolean;
  tags?: string[];
}

interface SourceMetadata {
  source: string;
  status: string;
  lastFetch: string;
  itemCount: number;
  error?: string;
}

export default function CodesPage() {
  const [codes, setCodes] = useState<Code[]>([]);
  const [filteredCodes, setFilteredCodes] = useState<Code[]>([]);
  const [sources, setSources] = useState<Record<string, SourceMetadata>>({});
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<"active" | "past7" | "all">("active");
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [reportingCode, setReportingCode] = useState<string | null>(null);
  const [showProvenance, setShowProvenance] = useState<string | null>(null);

  const fetchCodes = async (hardRefresh = false) => {
    if (hardRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const cache = hardRefresh ? "no-cache" : "default";
      const response = await fetch(`/api/codes?scope=${scope}`, { cache });
      
      if (response.ok) {
        const data = await response.json();
        setCodes(data.codes || []);
        setSources(data.sources || {});
      }
    } catch (error) {
      console.error("Failed to fetch codes:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, [scope]);

  // Client-side search filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCodes(codes);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = codes.filter((code) => {
      return (
        code.code.toLowerCase().includes(query) ||
        code.description?.toLowerCase().includes(query) ||
        code.title?.toLowerCase().includes(query) ||
        code.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    });

    setFilteredCodes(filtered);
  }, [searchQuery, codes]);

  const handleReportCode = async (code: string) => {
    setReportingCode(code);

    try {
      const response = await fetch("/api/codes/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          reason: "dead",
          guildId: "web",
          userId: "anonymous",
        }),
      });

      if (response.ok) {
        console.info("Code reported:", code);
        setTimeout(() => setReportingCode(null), 1000);
      }
    } catch (error) {
      console.error("Failed to report code:", error);
      setReportingCode(null);
    }
  };

  const allCodesText = filteredCodes.map((c) => c.code).join("\n");

  const getSourceBadge = (site: string) => {
    const badges: Record<string, { label: string; variant: any }> = {
      wiki: { label: "Wiki", variant: "default" },
      discord: { label: "Discord", variant: "default" },
      twitter: { label: "Twitter", variant: "default" },
      reddit: { label: "Reddit", variant: "secondary" },
      pocketgamer: { label: "PocketGamer", variant: "secondary" },
      snelp: { label: "Snelp", variant: "secondary" },
    };

    const badge = badges[site] || { label: site, variant: "outline" };
    return <Badge variant={badge.variant}>{badge.label}</Badge>;
  };

  const isExpiringSoon = (expiresAt?: string | null) => {
    if (!expiresAt) return false;
    const expiry = new Date(expiresAt);
    const now = new Date();
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    return expiry.getTime() - now.getTime() < threeDays;
  };

  return (
    <div className="container px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Secret Codes</h1>
          <p className="text-muted-foreground">
            Aggregated from Discord, Reddit, Wiki, PocketGamer, and Snelp
          </p>
        </div>

        {/* Filter Bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <Button
              variant={scope === "active" ? "neon" : "outline"}
              size="sm"
              onClick={() => setScope("active")}
            >
              Active
            </Button>
            <Button
              variant={scope === "past7" ? "neon" : "outline"}
              size="sm"
              onClick={() => setScope("past7")}
            >
              Past 7 Days
            </Button>
            <Button
              variant={scope === "all" ? "neon" : "outline"}
              size="sm"
              onClick={() => setScope("all")}
            >
              All
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchCodes(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            <span className="ml-2">Refresh</span>
          </Button>
        </div>

        {/* Search Box */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search codes, descriptions, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border bg-background px-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neon-green"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <>
            {/* Copy All Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Copy All Codes</CardTitle>
                <CardDescription>
                  {filteredCodes.length} code{filteredCodes.length !== 1 ? "s" : ""} available
                  {searchQuery && ` (filtered from ${codes.length})`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CopyBox content={allCodesText} label="Copy All" />
              </CardContent>
            </Card>

            {/* Empty State */}
            {filteredCodes.length === 0 ? (
              <Callout variant="warn">
                {searchQuery 
                  ? `No codes found matching "${searchQuery}"`
                  : "No codes available for the selected filter. Try a different scope or refresh."}
              </Callout>
            ) : (
              <div className="space-y-4">
                {filteredCodes.map((code, index) => (
                  <Card key={`${code.code}-${index}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="font-mono text-lg">
                              {code.code}
                            </CardTitle>
                            {code.verified && (
                              <Badge variant="default" className="text-xs">
                                Verified
                              </Badge>
                            )}
                          </div>
                          <CardDescription>
                            {code.title || code.description || "No description"}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Metadata */}
                        <div className="flex flex-wrap gap-2">
                          {code.region && code.region !== "global" && (
                            <Badge variant="outline">{code.region.toUpperCase()}</Badge>
                          )}
                          {code.expires_at && (
                            <Badge variant={isExpiringSoon(code.expires_at) ? "destructive" : "secondary"}>
                              {isExpiringSoon(code.expires_at) ? "Expires Soon" : "Expires"} {new Date(code.expires_at).toLocaleDateString()}
                            </Badge>
                          )}
                          {code.tags?.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Rewards */}
                        {code.rewards && code.rewards.length > 0 && (
                          <div className="text-sm text-muted-foreground">
                            <strong>Rewards:</strong> {code.rewards.join(", ")}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-wrap gap-2">
                            {Array.from(new Set(code.sources.map(s => s.site))).map((site) => (
                              <span key={site}>{getSourceBadge(site)}</span>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowProvenance(showProvenance === code.code ? null : code.code)}
                              className="text-xs"
                            >
                              <Info className="h-3 w-3 mr-1" />
                              Sources ({code.sources.length})
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReportCode(code.code)}
                              disabled={reportingCode === code.code}
                              className="text-xs"
                            >
                              <Flag className="h-3 w-3 mr-1" />
                              {reportingCode === code.code ? "Reported" : "Report"}
                            </Button>
                          </div>
                        </div>

                        {/* Provenance Drawer */}
                        {showProvenance === code.code && (
                          <div className="mt-3 rounded-md border bg-muted/50 p-3 text-sm">
                            <div className="font-semibold mb-2">Source Provenance</div>
                            <div className="space-y-2">
                              {code.sources.map((source, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    {getSourceBadge(source.site)}
                                    <span className="text-muted-foreground">
                                      {new Date(source.fetched_at).toLocaleString()}
                                    </span>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {Math.round(source.confidence * 100)}% confidence
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
