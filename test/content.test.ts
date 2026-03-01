import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { htmlToMarkdown, copySelectionAsMarkdown, showToast, writeToClipboard } from "../entrypoints/content";

/**
 * Helper: parse an HTML string and convert it via htmlToMarkdown.
 * Uses innerHTML on a test fixture — safe in a test-only context.
 */
function convert(html: string): string {
  const container = document.createElement("div");
  // eslint-disable-next-line no-unsanitized/property -- test-only fixture
  container.innerHTML = html;
  return htmlToMarkdown(container).replace(/\n{3,}/g, "\n\n").trim();
}

describe("htmlToMarkdown", () => {
  it("converts bold text", () => {
    expect(convert("<b>bold</b>")).toBe("**bold**");
    expect(convert("<strong>bold</strong>")).toBe("**bold**");
  });

  it("converts italic text", () => {
    expect(convert("<i>italic</i>")).toBe("*italic*");
    expect(convert("<em>italic</em>")).toBe("*italic*");
  });

  it("converts strikethrough text", () => {
    expect(convert("<s>strike</s>")).toBe("~~strike~~");
    expect(convert("<strike>strike</strike>")).toBe("~~strike~~");
    expect(convert("<del>strike</del>")).toBe("~~strike~~");
  });

  it("converts inline code", () => {
    expect(convert("<code>foo()</code>")).toBe("`foo()`");
  });

  it("converts code blocks", () => {
    expect(convert("<pre>const x = 1;</pre>")).toBe(
      "```\nconst x = 1;\n```",
    );
  });

  it("converts links", () => {
    expect(convert('<a href="https://example.com">click</a>')).toBe(
      "[click](https://example.com)",
    );
  });

  it("converts links without href as plain text", () => {
    expect(convert("<a>text</a>")).toBe("text");
  });

  it("converts line breaks", () => {
    expect(convert("hello<br>world")).toBe("hello\nworld");
  });

  it("converts blockquotes", () => {
    expect(convert("<blockquote>quoted text</blockquote>")).toBe(
      "> quoted text",
    );
  });

  it("converts multiline blockquotes", () => {
    expect(convert("<blockquote>line1<br>line2</blockquote>")).toBe(
      "> line1\n> line2",
    );
  });

  it("converts unordered lists", () => {
    expect(convert("<ul><li>one</li><li>two</li></ul>")).toBe(
      "- one\n- two",
    );
  });

  it("converts ordered lists", () => {
    expect(convert("<ol><li>first</li><li>second</li></ol>")).toBe(
      "1. first\n2. second",
    );
  });

  it("handles nested formatting", () => {
    expect(convert("<b><i>bold-italic</i></b>")).toBe("***bold-italic***");
  });

  it("passes through plain text", () => {
    expect(convert("just text")).toBe("just text");
  });

  it("returns empty string for empty input", () => {
    expect(convert("")).toBe("");
  });

  it("handles paragraphs with newlines", () => {
    expect(convert("<p>first</p><p>second</p>")).toBe("first\n\nsecond");
  });
});

describe("copySelectionAsMarkdown", () => {
  it("returns error when nothing is selected", () => {
    const result = copySelectionAsMarkdown();
    expect(result).toEqual({ success: false, error: "Nothing selected" });
  });

  it("copies selected HTML as markdown to clipboard", async () => {
    // Set up DOM content — using innerHTML for test fixture construction
    const el = document.createElement("div");
    // eslint-disable-next-line no-unsanitized/property -- test-only fixture
    el.innerHTML = "<b>hello</b> world";
    document.body.appendChild(el);

    // Create a selection over the element
    const range = document.createRange();
    range.selectNodeContents(el);
    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);

    // Mock clipboard with both write and writeText
    const write = vi.fn().mockResolvedValue(undefined);
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { write, writeText },
      writable: true,
      configurable: true,
    });

    const result = copySelectionAsMarkdown();
    expect(result.success).toBe(true);
    expect(result.markdown).toBe("**hello** world");
    expect(write).toHaveBeenCalledOnce();

    // Verify clipboard content
    await Promise.resolve();
    const item = write.mock.calls[0][0][0] as ClipboardItem;
    const plain = await item.getType("text/plain");
    expect(await plain.text()).toBe("**hello** world");

    // Cleanup
    document.body.removeChild(el);
    selection.removeAllRanges();
  });
});

describe("writeToClipboard", () => {
  let writeFn: ReturnType<typeof vi.fn>;
  let writeTextFn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    writeFn = vi.fn().mockResolvedValue(undefined);
    writeTextFn = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { write: writeFn, writeText: writeTextFn },
      writable: true,
      configurable: true,
    });
  });

  it("writes both text/plain and text/markdown blobs", async () => {
    await writeToClipboard("**hello** world");

    expect(writeFn).toHaveBeenCalledOnce();
    const item = writeFn.mock.calls[0][0][0] as ClipboardItem;
    expect(item.types).toContain("text/plain");
    expect(item.types).toContain("text/markdown");

    const plain = await item.getType("text/plain");
    expect(await plain.text()).toBe("**hello** world");
    const md = await item.getType("text/markdown");
    expect(await md.text()).toBe("**hello** world");
  });

  it("falls back to writeText when write() rejects", async () => {
    writeFn.mockRejectedValueOnce(new DOMException("Not allowed"));

    await writeToClipboard("fallback text");

    expect(writeFn).toHaveBeenCalledOnce();
    expect(writeTextFn).toHaveBeenCalledWith("fallback text");
  });

  it("rejects when both write() and writeText() fail", async () => {
    writeFn.mockRejectedValueOnce(new DOMException("Not allowed"));
    writeTextFn.mockRejectedValueOnce(new DOMException("Also not allowed"));

    await expect(writeToClipboard("text")).rejects.toThrow("Also not allowed");
  });
});

describe("showToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("appends a toast element to the body", () => {
    showToast("Test message");
    const toast = document.body.lastElementChild as HTMLElement;
    expect(toast).toHaveTextContent("Test message");
    expect(toast.style.position).toBe("fixed");

    vi.useRealTimers();
  });

  it("removes toast after timeout", () => {
    showToast("Disappearing");
    const toast = document.body.lastElementChild as HTMLElement;
    expect(toast).toBeInTheDocument();

    // After 2000ms, opacity fades
    vi.advanceTimersByTime(2000);
    expect(toast.style.opacity).toBe("0");

    // After another 300ms, element is removed
    vi.advanceTimersByTime(300);
    expect(toast).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});
