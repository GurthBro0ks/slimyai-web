export interface ApiError {
  ok: false;
  code: string;
  message: string;
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
  const baseUrl = process.env.NEXT_PUBLIC_ADMIN_API_BASE;

  if (!baseUrl) {
    return {
      ok: false,
      code: "CONFIG_ERROR",
      message: "Admin API base URL not configured",
    };
  }

  try {
    const url = `${baseUrl}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      return {
        ok: false,
        code: "UPSTREAM_ERROR",
        message: `Admin API returned ${response.status}`,
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
    };
  }
}
