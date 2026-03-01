import { defineConfig } from "wxt";

export default defineConfig({
  manifest: {
    name: "Slack to Markdown",
    description: "Copy selected Slack messages as Markdown",
    permissions: ["clipboardWrite", "activeTab"],
    icons: {
      48: "/icon.svg",
    },
    browser_action: {
      default_icon: "icon.svg",
      default_title: "Copy Slack selection as Markdown",
    },
    commands: {
      "copy-as-markdown": {
        suggested_key: {
          default: "Ctrl+Shift+M",
          mac: "MacCtrl+Shift+M",
        },
        description: "Copy selected Slack chat as Markdown",
      },
    },
  },
});
