/*
 * Best Home – site settings.
 * This is the ONLY file you need to touch to change where the menu comes from.
 */
window.BH_CONFIG = {
  // Option A (default): leave empty → the menu is read from /data/menu.json
  //
  // Option B (recommended): manage the menu in Google Sheets.
  //   1. Upload data/best-home-menu-sheet.xlsx to Google Drive, open it, and save it as a Google Sheet.
  //   2. Share → General access: "Anyone with the link" → Viewer → Copy link
  //      (or, on a computer: File → Share → Publish to web → "Menu" tab → CSV)
  //   3. Paste that link below. Sheet edits show on the site within a minute or so.
  sheetCsvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRtbu7XI00VrBMnHXjIo19qZAdmjCA5rEY6OoNnzVunjL6dQDd6jIwM28aTI9GvUg/pubhtml",

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
