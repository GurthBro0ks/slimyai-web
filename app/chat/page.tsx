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

        <Callout variant="warn" className="mb-8">
          Real-time chat requires WebSocket connection. Use Discord for now.
        </Callout>

        <Card>
          <CardHeader>
            <CardTitle>Chat Interface</CardTitle>
            <CardDescription>
              Chat with Slimy.ai using various personality modes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Chat interface coming soon. For now, use the Discord bot for conversations.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
