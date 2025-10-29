"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";

interface ServiceStatus {
  name: string;
  status: "healthy" | "degraded" | "down" | "loading";
  message?: string;
  responseTime?: number;
}

export default function StatusPage() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: "Admin API", status: "loading" },
    { name: "Codes Aggregator", status: "loading" },
  ]);
  const [refreshing, setRefreshing] = useState(false);

  const checkStatus = async () => {
    setRefreshing(true);
    
    // Check Admin API
    try {
      const start = Date.now();
      const res = await fetch("/api/diag");
      const responseTime = Date.now() - start;
      
      if (res.ok) {
        const data = await res.json();
        setServices(prev => prev.map(s => 
          s.name === "Admin API" 
            ? { ...s, status: "healthy", message: data.message || "Operational", responseTime }
            : s
        ));
      } else {
        setServices(prev => prev.map(s => 
          s.name === "Admin API" 
            ? { ...s, status: "down", message: "Service unavailable" }
            : s
        ));
      }
    } catch (error) {
      setServices(prev => prev.map(s => 
        s.name === "Admin API" 
          ? { ...s, status: "down", message: "Connection failed" }
          : s
      ));
    }

    // Check Codes API
    try {
      const start = Date.now();
      const res = await fetch("/api/codes?scope=active");
      const responseTime = Date.now() - start;
      
      if (res.ok) {
        const data = await res.json();
        setServices(prev => prev.map(s => 
          s.name === "Codes Aggregator" 
            ? { ...s, status: "healthy", message: `${data.codes?.length || 0} codes available`, responseTime }
            : s
        ));
      } else {
        setServices(prev => prev.map(s => 
          s.name === "Codes Aggregator" 
            ? { ...s, status: "degraded", message: "Partial data available" }
            : s
        ));
      }
    } catch (error) {
      setServices(prev => prev.map(s => 
        s.name === "Codes Aggregator" 
          ? { ...s, status: "down", message: "Connection failed" }
          : s
      ));
    }

    setRefreshing(false);
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const getStatusIcon = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "degraded":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "down":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Skeleton className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-green-600">Healthy</Badge>;
      case "degraded":
        return <Badge className="bg-yellow-600">Degraded</Badge>;
      case "down":
        return <Badge variant="destructive">Down</Badge>;
      default:
        return <Skeleton className="h-5 w-16" />;
    }
  };

  return (
    <div className="container px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold">System Status</h1>
            <p className="text-muted-foreground">
              Real-time status of Slimy.ai services
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkStatus}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            <span className="ml-2">Refresh</span>
          </Button>
        </div>

        <div className="space-y-4">
          {services.map((service) => (
            <Card key={service.name}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(service.status)}
                    <div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      {service.message && (
                        <CardDescription>{service.message}</CardDescription>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(service.status)}
                </div>
              </CardHeader>
              {service.responseTime && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Response time: {service.responseTime}ms
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
