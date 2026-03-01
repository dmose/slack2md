/**
 * Stubs for WXT auto-imported globals so tests can import entrypoint modules
 * without the WXT build pipeline.
 */
import { vi } from "vitest";

// @ts-expect-error -- stub for WXT auto-import
globalThis.defineContentScript = (config: unknown) => config;
// @ts-expect-error -- stub for WXT auto-import
globalThis.defineBackground = (fn: unknown) => fn;
// Stub ClipboardItem for tests (not available in happy-dom)
globalThis.ClipboardItem = class ClipboardItem {
  readonly types: string[];
  private _items: Record<string, Blob>;
  constructor(items: Record<string, Blob>) {
    this._items = items;
    this.types = Object.keys(items);
  }
  getType(type: string) {
    if (!(type in this._items)) {
      return Promise.reject(new DOMException(`${type} not found`, "NotFoundError"));
    }
    return Promise.resolve(this._items[type]);
  }
} as unknown as typeof globalThis.ClipboardItem;

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
