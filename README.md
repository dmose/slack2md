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

## Install (temporary, for development)

1. Open Firefox and go to `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on…**
3. Select the `manifest.json` file from this folder

## Usage

1. Select some chat messages on `*.slack.com`
2. Either:
   - **Right-click → "Copy as Markdown"**, or
   - Press **Alt+Shift+C**
3. Paste the Markdown wherever you need it
