import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import StatusPage from "@/app/status/page";

// Mock fetch for status checks
global.fetch = vi.fn();

describe("StatusPage", () => {
  const okDiagResponse = {
    ok: true,
    status: "operational",
    message: "Operational",
  };

  const okCodesResponse = {
    codes: [{ code: "A" }, { code: "B" }],
  };

  const mockApiSequence = (overrides?: { diag?: Partial<typeof okDiagResponse>; codes?: Partial<typeof okCodesResponse> }) => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...okDiagResponse, ...overrides?.diag }),
    } as Response);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...okCodesResponse, ...overrides?.codes }),
    } as Response);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the status page with title", async () => {
    mockApiSequence();

    await act(async () => {
      render(<StatusPage />);
    });

    expect(screen.getByText("System Status")).toBeInTheDocument();
    expect(screen.getByText("Real-time status of Slimy.ai services")).toBeInTheDocument();
  });

  it("should render service cards", async () => {
    mockApiSequence();

    await act(async () => {
      render(<StatusPage />);
    });

    expect(screen.getByText("Admin API")).toBeInTheDocument();
    expect(screen.getByText("Codes Aggregator")).toBeInTheDocument();
  });

  it("should render refresh button", async () => {
    mockApiSequence();

    await act(async () => {
      render(<StatusPage />);
    });

    const refreshButton = screen.getByRole("button", { name: /refresh/i });
    expect(refreshButton).toBeInTheDocument();
  });

  it("updates statuses after API calls resolve", async () => {
    mockApiSequence({
      diag: { message: "Admin API reachable" },
      codes: { codes: [{ code: "A" }, { code: "B" }, { code: "C" }] },
    });

    await act(async () => {
      render(<StatusPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("Admin API")).toBeInTheDocument();
      expect(screen.getByText("Admin API reachable")).toBeInTheDocument();
      expect(screen.getByText(/3 codes available/)).toBeInTheDocument();
    });
  });
});
