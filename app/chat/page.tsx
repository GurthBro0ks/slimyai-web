import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Callout } from "@/components/ui/callout";
import { MessageSquare } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="container px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center gap-3">
          <MessageSquare className="h-10 w-10 text-neon-green" />
          <div>
            <h1 className="text-4xl font-bold">Slime Chat</h1>
            <p className="text-muted-foreground">
              AI-powered conversations with personality modes
            </p>
          </div>
        </div>

        <Card className="rounded-2xl border border-emerald-500/30 bg-zinc-900/40 shadow-sm">
          <CardHeader>
            <CardTitle>Chat Interface</CardTitle>
            <CardDescription>
              Chat with slimy.ai using various personality modes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Callout variant="note" className="text-sm">
              Web chat is coming; use Discord for now.
            </Callout>
            <p className="text-sm text-muted-foreground">
              Chat interface coming soon. For now, use the Discord bot for conversations.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
