import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import dynamic from "next/dynamic";

const inter = Inter({ subsets: ["latin"] });

const SlimeChatWindow = dynamic(
  () => import("@/components/slime-chat/slime-chat-window").then((mod) => mod.SlimeChatWindow),
  { ssr: false, loading: () => null }
);

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
        {enableSlimeChat && <SlimeChatWindow />}
      </body>
    </html>
  );
}
