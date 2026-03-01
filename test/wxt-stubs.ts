/**
 * Stubs for WXT auto-imported globals so tests can import entrypoint modules
 * without the WXT build pipeline.
 */
import { vi } from "vitest";

// @ts-expect-error -- stub for WXT auto-import
globalThis.defineContentScript = (config: unknown) => config;
// @ts-expect-error -- stub for WXT auto-import
globalThis.defineBackground = (fn: unknown) => fn;
// @ts-expect-error -- stub for WXT auto-import
globalThis.browser = {
  runtime: { onMessage: { addListener: vi.fn() } },
  browserAction: { onClicked: { addListener: vi.fn() } },
  commands: { onCommand: { addListener: vi.fn() } },
  tabs: {
    sendMessage: vi.fn(),
    query: vi.fn().mockResolvedValue([]),
  },
};
