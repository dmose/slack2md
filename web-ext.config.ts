import { defineWebExtConfig } from "wxt";

export default defineWebExtConfig({
  firefoxProfile: ".wxt/firefox-profile",
  keepProfileChanges: true,
});
