# Slack to Markdown — Firefox Extension

Copies your selected Slack messages as Markdown to the clipboard.

## Supported formatting

| Slack            | Markdown          |
|------------------|-------------------|
| **bold**         | `**bold**`        |
| *italic*         | `*italic*`        |
| ~~strikethrough~~| `~~strikethrough~~`|
| `code`           | `` `code` ``      |
| code blocks      | ` ``` ... ``` `   |
| links            | `[text](url)`     |
| blockquotes      | `> quoted`        |
| lists            | `- item` / `1. item` |

## Development

```sh
pnpm install
pnpm dev        # launches Firefox with the extension loaded + hot reload
```

## Build

```sh
pnpm build      # production build → .output/
pnpm zip        # create installable .zip
```

## Test & Lint

```sh
pnpm test       # run tests once
pnpm test:watch # run tests in watch mode
pnpm lint       # lint with oxlint
pnpm check      # lint + tests
```

## Usage

1. Select some chat messages on `*.slack.com`
2. Either:
   - Click the toolbar icon, or
   - Press **Ctrl+Shift+M** (or **MacCtrl+Shift+M** on macOS)
3. Paste the Markdown wherever you need it
