#!/usr/bin/env tsx
/**
 * CLI script for headless code aggregation
 * Runs aggregator and writes output to data/codes/
 *
 * Usage:
 *   pnpm codes:aggregate         - Run aggregation
 *   pnpm codes:aggregate --health - Just print health status
 */

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { aggregateCodes } from "../lib/codes-aggregator";

const DATA_DIR = join(process.cwd(), "data", "codes");
const INDEX_FILE = join(DATA_DIR, "index.json");
const SNAPSHOTS_DIR = join(DATA_DIR, "snapshots");

async function main() {
  const args = process.argv.slice(2);
  const healthOnly = args.includes("--health");

  console.log("=== Codes Aggregator ===\n");

  try {
    // Run aggregation
    const result = await aggregateCodes();

    // Print summary table
    console.log("Source Status Summary:");
    console.log("─".repeat(70));
    console.log(
      "Source".padEnd(15),
      "Status".padEnd(15),
      "Items".padEnd(10),
      "Last Fetch"
    );
    console.log("─".repeat(70));

    let totalCodes = 0;
    let failedCount = 0;
    let notConfiguredCount = 0;

    for (const [source, meta] of Object.entries(result.sources)) {
      const statusIcon =
        meta.status === "ok"
          ? "✓"
          : meta.status === "degraded"
          ? "⚠"
          : meta.status === "failed"
          ? "✗"
          : "○";

      console.log(
        `${statusIcon} ${source.padEnd(13)}`,
        meta.status.padEnd(15),
        String(meta.itemCount).padEnd(10),
        new Date(meta.lastFetch).toLocaleTimeString()
      );

      if (meta.status === "failed") failedCount++;
      if (meta.status === "not_configured") notConfiguredCount++;
      totalCodes += meta.itemCount;
    }

    console.log("─".repeat(70));
    console.log(`\nTotal unique codes: ${result.codes.length}`);
    console.log(`Verified codes: ${result.codes.filter(c => c.verified).length}`);
    console.log(`Generated at: ${new Date(result.generatedAt).toLocaleString()}\n`);

    // Exit if health-only mode
    if (healthOnly) {
      process.exit(0);
    }

    // Create directories if they don't exist
    mkdirSync(DATA_DIR, { recursive: true });
    mkdirSync(SNAPSHOTS_DIR, { recursive: true });

    // Write main index file
    writeFileSync(INDEX_FILE, JSON.stringify(result, null, 2));
    console.log(`✓ Wrote index: ${INDEX_FILE}`);

    // Write dated snapshot
    const datestamp = new Date().toISOString().split("T")[0];
    const snapshotFile = join(SNAPSHOTS_DIR, `${datestamp}.json`);
    writeFileSync(snapshotFile, JSON.stringify(result, null, 2));
    console.log(`✓ Wrote snapshot: ${snapshotFile}`);

    // Exit with failure if ALL sources failed
    if (failedCount > 0 && failedCount === Object.keys(result.sources).length - notConfiguredCount) {
      console.error("\n✗ All configured sources failed");
      process.exit(1);
    }

    // Warning if some sources failed
    if (failedCount > 0) {
      console.warn(`\n⚠ ${failedCount} source(s) failed (but job continues)`);
    }

    console.log("\n✓ Aggregation complete");
    process.exit(0);
  } catch (error) {
    console.error("\n✗ Aggregation failed:", error);
    process.exit(1);
  }
}

main();
