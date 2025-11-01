/**
 * Vitest setup file
 * Configures the test environment with jsdom and testing-library utilities
 */

import "@testing-library/jest-dom";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Cleanup after each test case (e.g., clearing jsdom)
afterEach(() => {
  cleanup();
});
