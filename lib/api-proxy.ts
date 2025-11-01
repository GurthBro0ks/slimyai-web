export interface ApiError {
  ok: false;
  code: string;
  message: string;
  status?: number;
  details?: unknown;
}

export interface ApiSuccess<T = unknown> {
  ok: true;
  data: T;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

export async function proxyToAdminApi<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const baseUrl = process.env.NEXT_PUBLIC_ADMIN_API_BASE?.trim();

  if (!baseUrl) {
    return {
      ok: false,
      code: "CONFIG_ERROR",
      message: "Admin API base URL not configured",
    };
  }

  try {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(
      normalizedPath,
      baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`
    ).toString();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "User-Agent": "slimyai-web/1.0 (+https://admin.slimyai.xyz)",
      ...(options?.headers ?? {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let details: unknown = null;
      try {
        details = await response.json();
      } catch {
        try {
          details = await response.text();
        } catch {
          details = null;
        }
      }

      return {
        ok: false,
        code: "UPSTREAM_ERROR",
        message: `Admin API returned ${response.status}`,
        status: response.status,
        details,
      };
    }

    const data = await response.json();
    return {
      ok: true,
      data: data as T,
    };
  } catch (error) {
    console.error("Admin API proxy error:", error);
    return {
      ok: false,
      code: "NETWORK_ERROR",
      message: "Failed to connect to Admin API",
      details: error instanceof Error ? error.message : error,
    };
  }
}
