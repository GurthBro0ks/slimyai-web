"use client";

import dynamic from "next/dynamic";

const SlimeChatWindow = dynamic(
  () => import("./slime-chat-window").then((mod) => mod.SlimeChatWindow),
  { ssr: false, loading: () => null }
);

export function SlimeChatWrapper() {
  return <SlimeChatWindow />;
}
