// background.js

// Handle toolbar button click — just send the message, let it fail
// naturally if the content script isn't there
browser.browserAction.onClicked.addListener((tab) => {
  browser.tabs.sendMessage(tab.id, { action: "copy-as-markdown" }).catch((err) => {
    console.error("Could not reach content script:", err);
  });
});

// Handle keyboard shortcut (Ctrl+Shift+M)
browser.commands.onCommand.addListener((command) => {
  if (command === "copy-as-markdown") {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (tabs[0]) {
        browser.tabs.sendMessage(tabs[0].id, { action: "copy-as-markdown" }).catch((err) => {
          console.error("Could not reach content script:", err);
        });
      }
    });
  }
});
