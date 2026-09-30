/*
 * Best Home – site settings.
 * This is the ONLY file you need to touch to change where the menu comes from.
 */
window.BH_CONFIG = {
  // Option A (default): leave empty → the menu is read from /data/menu.json
  //
  // Option B (recommended): manage the menu in Google Sheets.
  //   1. Upload data/best-home-menu-sheet.xlsx to Google Drive → Open with Google Sheets
  //      (File → Save as Google Sheets)
  //   2. File → Share → Publish to web → pick the "Menu" tab + "Comma-separated values (.csv)" → Publish
  //   3. Paste the link below. Edits in the sheet appear on the site within a few minutes,
  //      no redeploy needed.
  sheetCsvUrl: "",

  // true shows an "All concepts" button on every page (used while presenting the designs).
  // The Tiles design was chosen, so it's off. The overview is still at /concepts/.
  demo: false,

  currency: "USD",
  locale: "en-US",

  // Optional details shown in the footer of the menu (leave "" to hide)
  phone: "",
  instagram: "",   // e.g. "besthome.lb"
  address: "",
  hours: "",
};
