"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Callout } from "@/components/ui/callout";
import { Upload, BarChart3, Users, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ClubPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      // TODO: Connect to MCP club.analytics tool for screenshot processing
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('screenshots', file);
      });

      // Placeholder: Simulate upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newFiles = Array.from(files).map(f => f.name);
      setUploadedFiles([...uploadedFiles, ...newFiles]);
      
      // TODO: Call API route that connects to MCP
      // const response = await fetch('/api/club/upload', {
      //   method: 'POST',
      //   body: formData,
      // });
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleExportToSheets = async () => {
    try {
      // TODO: Connect to MCP google.sheets tool
      // const response = await fetch('/api/club/export', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ guildId: 'current-guild-id' }),
      // });
      
      alert('Export to Google Sheets functionality will be available once MCP integration is complete.');
    } catch (error) {
      console.error('Error exporting to sheets:', error);
    }
  };

  return (
    <div className="container px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Club Analytics</h1>
          <p className="text-muted-foreground">
            Track club performance and member statistics
          </p>
        </div>

        <Callout variant="note" className="mb-6 text-sm">
          Connect Admin API to enable club analytics features. MCP integration in progress.
        </Callout>

        {/* Google Sheets Export Button */}
        <div className="mb-6">
          <Button
            onClick={handleExportToSheets}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export to Google Sheets
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Upload Screenshots Card */}
          <Card className="rounded-2xl border border-emerald-500/30 bg-zinc-900/40 shadow-sm hover:bg-zinc-900/60 transition-colors">
            <CardHeader>
              <Upload className="h-10 w-10 text-neon-green mb-2" />
              <CardTitle>Upload Screenshots</CardTitle>
              <CardDescription>
                Upload club screenshots for analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <label className="block">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="block w-full text-sm text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-emerald-500 file:text-white
                      hover:file:bg-emerald-600
                      file:cursor-pointer cursor-pointer
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </label>
                
                {isUploading && (
                  <p className="text-sm text-emerald-500">Uploading...</p>
                )}
                
                {uploadedFiles.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    <p className="font-semibold mb-1">Uploaded files:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {uploadedFiles.map((file, index) => (
                        <li key={index} className="truncate">{file}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Analytics Card */}
          <Card className="rounded-2xl border border-emerald-500/30 bg-zinc-900/40 shadow-sm">
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-neon-green mb-2" />
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                View detailed club performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Performance tracking</p>
                <p>• Historical comparisons</p>
                <p>• Trend analysis</p>
                <p className="text-emerald-500 font-semibold mt-4">Coming soon</p>
              </div>
            </CardContent>
          </Card>

          {/* Member Stats Card */}
          <Card className="rounded-2xl border border-emerald-500/30 bg-zinc-900/40 shadow-sm">
            <CardHeader>
              <Users className="h-10 w-10 text-neon-green mb-2" />
              <CardTitle>Member Stats</CardTitle>
              <CardDescription>
                Track individual member contributions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Individual performance</p>
                <p>• Contribution tracking</p>
                <p>• Activity history</p>
                <p className="text-emerald-500 font-semibold mt-4">Coming soon</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
