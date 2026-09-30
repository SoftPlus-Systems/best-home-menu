# Best Home · Digital Menu

A light, mobile-first digital menu for **Best Home**. The menu is edited in **Google Sheets**
and the website updates itself. It's a plain static site: no build step, no database, no
server. It runs free on Vercel or Netlify.

| Path | What it is |
|---|---|
| `/` | **The menu** (Tiles design, chosen by the restaurant) |
| `/manage/` | Staff tools: compare a POS export against the menu, make the table QR code |
| `/concepts/` | The three original design concepts (Scroll, Tiles, Editorial), kept for reference |

## Deploy

**Vercel:** Add New → Project → import this repo. Preset **Other**, root `./`, no build
command, then Deploy. `vercel.json` and `.vercelignore` are already set up, so internal files
(`tools/`, the raw POS export) are not published.

**Netlify:** Add new site → Import from GitHub. Leave the build command empty and set the
publish directory to `.`. `netlify.toml` covers the rest.

Every push to the production branch (`main`) redeploys automatically.

## Editing the menu: Google Sheets (one-time setup, about 5 minutes)

1. Upload **`data/best-home-menu-sheet.xlsx`** to Google Drive and open it with Google Sheets
   (**File → Save as Google Sheets**). It already has the whole menu, dropdowns for
   category / visible / signature, and a **How to edit** tab for the staff.
2. In the sheet, go to **File → Share → Publish to web**. Choose the **Menu** tab and
   **Comma-separated values (.csv)**, click **Publish**, and copy the link.
3. Paste that link into **`assets/config.js`** as `sheetCsvUrl`, then commit. This is the only
   code change ever needed.

From then on:
- **Change a price:** edit the cell. The site shows it within about 5 minutes (Google's publish delay).
- **Sold out or seasonal:** set `visible` to `no`.
- **Add a dish:** add a row in its category with `visible` set to `yes`.
- **Sizes:** rows with the same name in the same category become one dish
  (Whisky → Glass / ¼ / ½ / Bottle). Put the size in `option`.
- **Order:** the site follows the row order for both dishes and categories.
- **Who can edit:** share the sheet with staff as *Editor*. Everyone else only sees the website.

**Safety net:** if Google is unreachable or the sheet is broken (for example, a header was
renamed), each phone keeps showing the last good menu it loaded. A first-time visitor sees
the built-in `data/menu.json` instead.

**Checking prices against the till:** open `/manage/` and drop the POS Excel export there. It
lists every item whose till price differs from the menu, plus new till items, so staff can
update those cells in the sheet.

**QR code:** `/manage/` → QR code. Enter the final address and download the PNG for the
table cards.

### Without Google Sheets (fallback)
If `sheetCsvUrl` is empty, the menu comes from `data/menu.json`. The `/manage/` page then
also offers a full editor with **Publish → Download menu.json**, which you upload to `data/`
on GitHub.

### Rebuilding everything from a new POS export (developer)
```bash
pip install openpyxl
cp ~/Downloads/menu.xlsx data/pos-export.xlsx
python3 tools/build_menu.py   # writes menu.json, menu.csv and best-home-menu-sheet.xlsx
```
Display names, categories and size groupings live in `tools/build_menu.py`.

## Optional footer details
In `assets/config.js`, fill in `phone`, `instagram`, `address` or `hours` to show them at the
bottom of the menu.

## How the POS export was cleaned up
The till export has 310 lines. The menu shows **255 of them as 225 dishes**:
- Short till names were rewritten for guests: `HAMB+POT+PEP` → *Burger Combo*,
  `CEAZER SALAD` → *Caesar Salad*.
- Sizes were grouped into one dish: Whisky → Glass / ¼ / ½ / Bottle.
- Items were moved to better categories: Banana Split was under *Alcohols*, Kale Salad was
  under *Starters*. Pasta, Combo Meals, Iced Coffee, Mocktails, Beer, Wine and Spirits now
  have their own categories.
- **Hidden (55):** staff items, "work" and "off." items, birthday service, $0 items, and
  older duplicates (for example, two Orange Juice prices; the newer code is kept). They are
  all still in the sheet with `visible = no`.

**Please ask the restaurant to check:** *Halabieh*, *Pumpkin Kibbeh* (till: PUMPKIN),
*Chocolate Mousse* (till: CHOCOLA MOU), *Polo Lemonade*, *Whisky Black*, and the Ksara wine
colours (Sunset = rosé, Réserve du Couvent = red, Blanc de Blancs = white).

## Tech notes
- Plain HTML, CSS and JS, with fonts self-hosted in `assets/fonts`. No third-party requests.
- Light mode only, by design (`color-scheme: light`).
- Shared data layer: `assets/menu-core.js`. Icons: `assets/icons.js`.
- `assets/vendor/`: SheetJS (reads the Excel file in the Manager) and qrcode-generator.
