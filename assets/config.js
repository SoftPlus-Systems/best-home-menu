/*
 * Best Home – site settings.
 * This is the ONLY file you need to touch to change where the menu comes from.
 */
window.BH_CONFIG = {
  // Option A (default): leave empty → the menu is read from /data/menu.json
  //
  // Option B: manage the menu in Google Sheets.
  //   1. Import data/menu.csv into a Google Sheet
  //   2. File → Share → Publish to web → "Comma-separated values (.csv)" → Publish
  //   3. Paste the link below. Edits in the sheet appear on the site within a few minutes,
  //      no redeploy needed.
  sheetCsvUrl: "",

  // true while presenting the 3 design concepts (shows a "← All concepts" pill).
  // Set to false once the customer has picked one.
  demo: true,

  currency: "USD",
  locale: "en-US",

  // Optional details shown in the footer of the menu (leave "" to hide)
  phone: "",
  instagram: "",   // e.g. "besthome.lb"
  address: "",
  hours: "",
};
