export const dynamic = "force-dynamic"
async function getStatus() {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? ""
  try {
    const res = await fetch(`${base}/api/bedrock-status`, { cache: "no-store" })
    if (!res.ok) return { online:false }
    return res.json()
  } catch { return { online:false } }
}
export default async function SlimeCraftPage(){
  const status = (await getStatus()) as any
  const online = !!status?.online
  return (
    <main className="p-8 max-w-2xl space-y-4">
      <h1 className="text-3xl">slime.craft — Bedrock Server</h1>
      <div className={`rounded-xl p-4 ${online ? "bg-green-900/30 border border-green-600/40" : "bg-red-900/30 border border-red-600/40"}`}>
        <div className="text-lg">{online ? "Online" : "Offline"}</div>
        {online && (
          <ul className="mt-1 text-sm opacity-80">
            {status.version && <li>Version: <code>{status.version}</code></li>}
            {status.players && <li>Players: {status.players.online} / {status.players.max}</li>}
            {status.motd && <li>MOTD: {status.motd}</li>}
          </ul>
        )}
        {!online && status?.error && <p className="text-sm opacity-70 mt-1">Error: {status.error}</p>}
      </div>
      <section className="mt-6">
        <h2 className="text-xl mb-2">How to join</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Open Minecraft &gt; Play &gt; Servers &gt; Add Server</li>
          <li>Server Name: <strong>slime.craft</strong></li>
          <li>Address: <code>{process.env.NEXT_PUBLIC_SLIMECRAFT_ADDR || "your-public-ip"}</code></li>
          <li>Port: <code>{process.env.NEXT_PUBLIC_SLIMECRAFT_PORT || "19132"}</code> (UDP)</li>
        </ol>
      </section>
    </main>
  )
}
