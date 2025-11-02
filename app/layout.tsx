import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SlimeChatWrapper } from "@/components/slime-chat/slime-chat-wrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Slimy.ai - AI-Powered Discord Bot",
  description: "Your AI-powered Discord companion for Super Snail and more",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const slimeChatFlag = process.env.ENABLE_SLIME_CHAT ?? process.env.NEXT_PUBLIC_ENABLE_SLIME_CHAT;
  const enableSlimeChat = slimeChatFlag?.toLowerCase() === "true";

  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        {enableSlimeChat && <SlimeChatWrapper />}
      </body>
    </html>
  );
}
