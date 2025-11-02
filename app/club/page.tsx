"use client";

import * as React from "react";
import { Upload, CloudDownload, BarChart3, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";

interface UploadResponse {
  jobId?: string;
  status?: string;
  message?: string;
}

export default function ClubPage() {
  const analyticsFlag = process.env.NEXT_PUBLIC_ENABLE_CLUB_ANALYTICS ?? process.env.ENABLE_CLUB_ANALYTICS;
  const sheetsFlag = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_SHEETS_EXPORT ?? process.env.ENABLE_GOOGLE_SHEETS_EXPORT;
  const enableAnalytics = analyticsFlag === "true" || analyticsFlag?.toLowerCase() === "true";
  const enableSheets = sheetsFlag === "true" || sheetsFlag?.toLowerCase() === "true";

  const [uploading, setUploading] = React.useState(false);
  const [selectedFileName, setSelectedFileName] = React.useState<string | null>(null);
  const [exporting, setExporting] = React.useState(false);
  const [uploadMessage, setUploadMessage] = React.useState<string | null>(null);
  const [exportMessage, setExportMessage] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleScreenshotUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      setUploadMessage("Choose a PNG or JPG screenshot to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setUploadMessage(null);

    try {
      const response = await fetch("/api/club/upload", {
        method: "POST",
        body: formData,
      });

      const payload: UploadResponse = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? "Upload failed");
      }

      setUploadMessage(payload.message ?? "Screenshot queued for analysis. You will see insights in Club Analytics once processing is complete.");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setSelectedFileName(null);
    } catch (error) {
      console.error("[club:upload]", error);
      setUploadMessage((error as Error).message ?? "Upload failed. Try again later.");
    } finally {
      setUploading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setExportMessage(null);

    try {
      const response = await fetch("/api/club/export", { method: "POST" });
      const payload: UploadResponse = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? "Export failed");
      }
      setExportMessage(payload.message ?? "Export started. Check Google Sheets for the new tab once complete.");
    } catch (error) {
      console.error("[club:export]", error);
      setExportMessage((error as Error).message ?? "Export failed. Try again later.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#050505] via-[#090b12] to-[#050806]" />
      <div className="container relative px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl space-y-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-emerald-100 sm:text-5xl">Club Analytics Command Deck</h1>
          <p className="text-lg text-zinc-400 sm:text-xl">
            Upload screenshots, unlock MCP-powered analytics, and push clean data to your sheets. Built for officers, captains, and tacticians who want instant visibility.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-6 rounded-3xl border border-emerald-500/20 bg-[#0b0f0d]/90 p-8 shadow-[0_0_24px_rgba(16,185,129,0.18)]">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 text-emerald-200">
                <Upload className="h-10 w-10" />
                <div className="text-left">
                  <h2 className="text-2xl font-semibold">Upload Screenshots</h2>
                  <p className="text-sm text-emerald-200/80">
                    Accepted formats: PNG, JPG. Max size matches MCP configuration.
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold uppercase",
                  enableAnalytics
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                    : "border-amber-400/40 bg-amber-400/10 text-amber-200"
                )}
              >
                {enableAnalytics ? "Live" : "Pending MCP"}
              </span>
            </header>

            <form onSubmit={handleScreenshotUpload} className="space-y-6">
              <label className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-emerald-500/40 bg-[#06080b]/60 px-6 py-10 text-center text-sm text-zinc-400 transition hover:border-emerald-400/70 hover:text-emerald-200">
                <input
                  ref={fileInputRef}
                  type="file"
                  name="file"
                  accept="image/png,image/jpeg"
                  className="sr-only"
                  disabled={uploading}
                  onChange={(event) => {
                    const nextFile = event.target.files?.[0];
                    setSelectedFileName(nextFile ? nextFile.name : null);
                  }}
                />
                <div className="flex flex-col items-center gap-3 text-emerald-200">
                  <BarChart3 className="h-10 w-10" />
                  <span className="font-semibold">Drag & drop or browse</span>
                </div>
                <span className="text-xs text-zinc-500">
                  The MCP pipeline captures OCR, statistics, and squad contributions automatically.
                </span>
              </label>
              {selectedFileName && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-xs text-emerald-200">
                  Selected: {selectedFileName}
                </div>
              )}

              <Button
                type="submit"
                variant="neon"
                className="w-full bg-emerald-500 text-zinc-900 hover:bg-emerald-400"
                disabled={uploading}
              >
                {uploading ? "Uploading…" : "Send to MCP"}
              </Button>
            </form>

            {uploadMessage && (
              <Callout variant={uploading ? "info" : "success"}>
                {uploadMessage}
              </Callout>
            )}
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-emerald-500/15 bg-[#06090b]/90 p-6 shadow-[0_0_18px_rgba(16,185,129,0.15)]">
              <header className="mb-4 flex items-start justify-between text-emerald-200">
                <div className="flex items-center gap-3">
                  <CloudDownload className="h-7 w-7" />
                  <h3 className="text-lg font-semibold">Export Club Data</h3>
                </div>
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase",
                    enableSheets
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                      : "border-amber-400/30 bg-amber-400/10 text-amber-200"
                  )}
                >
                  {enableSheets ? "Ready" : "Setup"}
                </span>
              </header>
              <p className="text-sm text-zinc-400">
                Trigger an immediate export to Google Sheets (or the storage defined in your MCP deployment). Results are streamed through the MCP gateway with retention policies applied automatically.
              </p>
              <Button
                onClick={handleExport}
                variant="neon"
                className="mt-4 w-full bg-emerald-500 text-zinc-900 hover:bg-emerald-400"
                disabled={exporting}
              >
                {exporting ? "Exporting…" : "Run Export"}
              </Button>
              {exportMessage && (
                <Callout variant={exporting ? "info" : "success"} className="mt-4">
                  {exportMessage}
                </Callout>
              )}
            </div>

            <div className="rounded-3xl border border-emerald-500/15 bg-[#090c0f]/90 p-6 text-sm text-zinc-300 shadow-[0_0_18px_rgba(16,185,129,0.14)]">
              <div className="mb-4 flex items-center gap-3 text-emerald-200">
                <Activity className="h-5 w-5" />
                <h3 className="font-semibold uppercase tracking-[0.3em]">Pipeline status</h3>
              </div>
              <ul className="space-y-2 text-xs text-zinc-400">
                <li>• Uploads are routed through the MCP club analytics service.</li>
                <li>• Processing queue respects your retention settings.</li>
                <li>• Exports require the Google service account JSON path.</li>
                <li>• Webhooks can broadcast completion to Discord channels.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
