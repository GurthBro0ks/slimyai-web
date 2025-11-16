import dgram from "node:dgram"
import { randomBytes } from "node:crypto"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type BedrockInfo = {
  online: boolean
  motd?: string
  version?: string
  protocol?: string
  players?: { online: number, max: number }
  raw?: string
  error?: string
}

function buildPingPacket(): Buffer {
  const magic = Buffer.from([0x00,0xff,0xff,0x00,0xfe,0xfe,0xfe,0xfe,0xfd,0xfd,0xfd,0xfd,0x12,0x34,0x56,0x78])
  const buf = Buffer.alloc(1 + 8 + 8 + magic.length + 1)
  let o = 0
  buf[o++] = 0x01
  buf.writeBigInt64BE(BigInt(Date.now()), o); o += 8
  randomBytes(8).copy(buf, o); o += 8
  magic.copy(buf, o); o += magic.length
  buf[o++] = 0x00
  return buf
}

function parsePong(b: Buffer): BedrockInfo {
  const magic = Buffer.from([0x00,0xff,0xff,0x00,0xfe,0xfe,0xfe,0xfe,0xfd,0xfd,0xfd,0xfd,0x12,0x34,0x56,0x78])
  const idx = b.indexOf(magic)
  if (idx < 0) return { online: true, raw: b.toString("utf8") }
  const str = b.subarray(idx + magic.length).toString("utf8").replace(/^\x00+/, "")
  const parts = str.split(";")
  const info: BedrockInfo = { online: true, raw: str }
  if (parts[0] === "MCPE") {
    info.motd = parts[1] || undefined
    info.protocol = parts[2] || undefined
    info.version = parts[3] || undefined
    const pNow = parseInt(parts[4] || "0", 10)
    const pMax = parseInt(parts[5] || "0", 10)
    info.players = { online: isNaN(pNow)?0:pNow, max: isNaN(pMax)?0:pMax }
  }
  return info
}

export async function GET() {
  const host = process.env.NUC1_BEDROCK_HOST || process.env.NEXT_PUBLIC_SLIMECRAFT_ADDR || "192.168.68.64"
  const port = parseInt(process.env.NUC1_BEDROCK_PORT || process.env.NEXT_PUBLIC_SLIMECRAFT_PORT || "19132", 10)

  const socket = dgram.createSocket("udp4")
  const pkt = buildPingPacket()
  const result: BedrockInfo = await new Promise((resolve) => {
    const to = setTimeout(() => { socket.close(); resolve({ online: false, error: "timeout" }) }, 1200)
    socket.once("message", (msg) => { clearTimeout(to); try { resolve(parsePong(msg)) } catch (e:any){ resolve({ online:true, error:e?.message, raw: msg.toString("hex") }) } finally { socket.close() } })
    socket.send(pkt, port, host, (err) => { if (err) { clearTimeout(to); socket.close(); resolve({ online:false, error: err.message }) } })
  })

  return new Response(JSON.stringify(result), { headers: { "content-type": "application/json", "cache-control":"no-store" } })
}
