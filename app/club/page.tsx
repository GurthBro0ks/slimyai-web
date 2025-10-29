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

        <Callout variant="info" className="mb-8">
          Connect Admin API to enable club analytics features.
        </Callout>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
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

          <Card>
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

          <Card>
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
