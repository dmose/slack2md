/**
 * Convert an HTML node tree (from the user's selection) into Markdown.
 * Handles: bold, italic, links, code, strikethrough, line breaks,
 * blockquotes, lists, and code blocks.
 */
export function htmlToMarkdown(node: Node): string {
  // Text node — return its content
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? "";
  }

  // Not an element — skip
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();

  // Recurse into children first
  let inner = "";
  for (const child of el.childNodes) {
    inner += htmlToMarkdown(child);
  }

  switch (tag) {
    // Bold
    case "b":
    case "strong":
      return `**${inner.trim()}**`;

    // Italic
    case "i":
    case "em":
      return `*${inner.trim()}*`;

    // Strikethrough
    case "s":
    case "strike":
    case "del":
      return `~~${inner.trim()}~~`;

    // Inline code
    case "code":
      return `\`${inner}\``;

    // Code blocks (pre)
    case "pre":
      return `\n\`\`\`\n${inner.trim()}\n\`\`\`\n`;

    // Links
    case "a": {
      const href = el.getAttribute("href");
      if (href) {
        return `[${inner.trim()}](${href})`;
      }
      return inner;
    }

    // Line breaks
    case "br":
      return "\n";

    // Block-level elements get newlines around them
    case "p":
    case "div":
    case "blockquote":
      if (tag === "blockquote") {
        const quoted = inner
          .trim()
          .split("\n")
          .map((line) => `> ${line}`)
          .join("\n");
        return `\n${quoted}\n`;
      }
      return `\n${inner}\n`;

    // Lists
    case "ul":
    case "ol":
      return `\n${inner}\n`;

    case "li": {
      const parent = el.parentElement;
      if (parent && parent.tagName.toLowerCase() === "ol") {
        const index = Array.from(parent.children).indexOf(el) + 1;
        return `${index}. ${inner.trim()}\n`;
      }
      return `- ${inner.trim()}\n`;
    }

    // Everything else — just pass through the inner content
    default:
      return inner;
  }
}

/**
 * Get the user's selection as an HTML fragment, convert it, and
 * write the Markdown to the clipboard.
 */
export function copySelectionAsMarkdown(): {
  success: boolean;
  markdown?: string;
  error?: string;
} {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    return { success: false, error: "Nothing selected" };
  }

  // Clone the selected DOM fragment so we can walk it
  const range = selection.getRangeAt(0);
  const fragment = range.cloneContents();

  // Wrap in a container so we can iterate child nodes
  const container = document.createElement("div");
  container.appendChild(fragment);

  const markdown = htmlToMarkdown(container)
    // Collapse 3+ newlines into 2
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Write to clipboard
  navigator.clipboard.writeText(markdown).then(
    () => showToast("Copied as Markdown!"),
    (err) => showToast(`Clipboard error: ${err}`),
  );

  return { success: true, markdown };
}

/**
 * Tiny non-intrusive toast notification so the user gets feedback.
 */
export function showToast(message: string): void {
  const toast = document.createElement("div");
  toast.textContent = message;
  Object.assign(toast.style, {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    background: "#1d1c1d",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
    zIndex: "999999",
    boxShadow: "0 4px 12px rgba(0,0,0,.3)",
    transition: "opacity 0.3s",
    opacity: "1",
  });
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

export default defineContentScript({
  matches: ["*://*.slack.com/*"],
  main() {
    browser.runtime.onMessage.addListener((msg) => {
      if (msg.action === "copy-as-markdown") {
        copySelectionAsMarkdown();
      }
    });

    console.log(
      "[Slack to Markdown] Content script loaded on",
      window.location.href,
    );
  },
});
