"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyBox } from "@/components/ui/copy-box";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Callout } from "@/components/ui/callout";
import { RefreshCw } from "lucide-react";

interface Code {
  code: string;
  source: "snelp" | "reddit" | "sample";
  ts: string;
  tags?: string[];
  expires?: string | null;
  region?: string | null;
}

export default function CodesPage() {
  const [codes, setCodes] = useState<Code[]>([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<"active" | "past7" | "all">("active");
  const [refreshing, setRefreshing] = useState(false);

  const fetchCodes = async (hardRefresh = false) => {
    if (hardRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const cache = hardRefresh ? "no-cache" : "default";
      const response = await fetch(`/api/codes?scope=${scope}`, { cache });
      
      if (response.ok) {
        const data = await response.json();
        setCodes(data.codes || []);
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

  const allCodesText = codes.map((c) => c.code).join("\n");

  const getSourceBadge = (source: Code["source"]) => {
    switch (source) {
      case "snelp":
        return <Badge variant="default">Snelp</Badge>;
      case "reddit":
        return <Badge variant="secondary">Reddit</Badge>;
      default:
        return <Badge variant="outline">Sample</Badge>;
    }
  };

  return (
    <div className="container px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Secret Codes</h1>
          <p className="text-muted-foreground">
            Aggregated from Snelp and Reddit r/SuperSnailGame
          </p>
        </div>

        <Callout variant="info" className="mb-6">
          Connect Admin API to enable live code updates. Currently showing sample data.
        </Callout>

        <div className="mb-6 flex flex-wrap items-center gap-4">
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

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Copy All Codes</CardTitle>
                <CardDescription>
                  {codes.length} code{codes.length !== 1 ? "s" : ""} available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CopyBox content={allCodesText} label="Copy All" />
              </CardContent>
            </Card>

            <div className="space-y-4">
              {codes.map((code, index) => (
                <Card key={`${code.code}-${index}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="font-mono text-lg">
                          {code.code}
                        </CardTitle>
                        <CardDescription>
                          Added {new Date(code.ts).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      {getSourceBadge(code.source)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {code.region && (
                        <Badge variant="outline">{code.region.toUpperCase()}</Badge>
                      )}
                      {code.expires && (
                        <Badge variant="destructive">
                          Expires {new Date(code.expires).toLocaleDateString()}
                        </Badge>
                      )}
                      {code.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
