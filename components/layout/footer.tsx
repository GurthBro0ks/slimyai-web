import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-bold text-neon-green">Slimy.ai</h3>
            <p className="text-sm text-muted-foreground">
              Your AI-powered Discord companion for Super Snail and more.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/features" className="text-muted-foreground hover:text-neon-green">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-muted-foreground hover:text-neon-green">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/status" className="text-muted-foreground hover:text-neon-green">
                  Status
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold">Tools</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/snail" className="text-muted-foreground hover:text-neon-green">
                  Snail Tools
                </Link>
              </li>
              <li>
                <Link href="/club" className="text-muted-foreground hover:text-neon-green">
                  Club Analytics
                </Link>
              </li>
              <li>
                <Link href="/chat" className="text-muted-foreground hover:text-neon-green">
                  Slime Chat
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold">Community</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://discord.gg/supersnail"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-neon-green"
                >
                  Discord
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/slimyai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-neon-green"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} Slimy.ai. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
