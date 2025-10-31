import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Callout } from "@/components/ui/callout";
import { Upload, BarChart3, Users } from "lucide-react";

export default function ClubPage() {
  return (
    <div className="container px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Club Analytics</h1>
          <p className="text-muted-foreground">
            Track club performance and member statistics
          </p>
        </div>

        <Callout variant="note" className="mb-6 text-sm">
          Connect Admin API to enable club analytics features.
        </Callout>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="rounded-2xl border border-emerald-500/30 bg-zinc-900/40 shadow-sm">
            <CardHeader>
              <Upload className="h-10 w-10 text-neon-green mb-2" />
              <CardTitle>Upload Screens</CardTitle>
              <CardDescription>
                Upload club screenshots for analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-emerald-500/30 bg-zinc-900/40 shadow-sm">
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-neon-green mb-2" />
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                View detailed club performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-emerald-500/30 bg-zinc-900/40 shadow-sm">
            <CardHeader>
              <Users className="h-10 w-10 text-neon-green mb-2" />
              <CardTitle>Member Stats</CardTitle>
              <CardDescription>
                Track individual member contributions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
