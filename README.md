# Best Home · Digital Menu

A light, mobile-first digital menu for **Best Home**, with three design concepts and a
no-code way to manage the menu. It's a plain static site: no build step, no database,
no server. It runs free on Netlify.

| Path | What it is |
|---|---|
| `/` | Concept overview for presenting to the customer |
| `/scroll/` | **Concept 01 · Scroll**: one page, sticky category bar, live search |
| `/tiles/` | **Concept 02 · Tiles**: app-like category grid, swipe between categories, dish detail sheet |
| `/editorial/` | **Concept 03 · Editorial**: printed-menu typography, contents sidebar, printable |
| `/manage/` | **Menu Manager**: edit items and prices, import the POS Excel file, make QR codes |

All three concepts read the same data (`data/menu.json`), so switching designs never
means re-entering the menu.

## Deploy on Netlify (about 2 minutes)

1. In Netlify, go to **Add new site → Import an existing project → GitHub** and pick this repository.
2. Leave **Build command** empty and set **Publish directory** to `.` (both are already in `netlify.toml`).
3. Click **Deploy**. Every push to the branch redeploys automatically.

For a quicker test without Git, drag the whole folder onto <https://app.netlify.com/drop>.

## Managing the menu

### Option 1: Menu Manager (recommended)
Open `/manage/` on the live site.
- **Items**: rename dishes, change prices, add sizes, write descriptions, hide sold-out
  items (toggle), and star house signatures.
- **Categories**: rename, reorder and change icons.
- **Update prices from POS**: drop the till's Excel export (same format as `menu.xlsx`).
  Prices are matched by **item code**, so the curated names stay. New till items come in hidden.
- **Preview**: see your changes in any of the three designs before publishing.
- **Publish**: download `menu.json` and upload it to `data/` on GitHub
  (**Add file → Upload files → Commit**). Netlify redeploys in about 30 seconds.
- **QR code**: generates a branded QR code (PNG) for table cards.

Edits are saved in the browser until they are published, so closing the tab loses nothing.

### Option 2: Google Sheets (live, no publishing step)
1. In the Manager go to **Publish → Download menu.csv**, then import it into a Google Sheet.
2. In the sheet, choose **File → Share → Publish to web → CSV** and copy the link.
3. Paste the link into `assets/config.js` as `sheetCsvUrl`.

After that, edits in the sheet show on the site within a few minutes. If the sheet ever
fails to load, the site falls back to `data/menu.json`.

Columns: `code, category, name, option, price, description, tags, visible`. Rows with the
same **name** in the same **category** are shown as one dish with several sizes.

### Option 3: Rebuild from a fresh POS export (developer)
```bash
pip install openpyxl
cp ~/Downloads/menu.xlsx data/pos-export.xlsx
python3 tools/build_menu.py
```
The display names, categories and size groupings live in `tools/build_menu.py`.

## When the customer has chosen a design
1. In `assets/config.js`, set `demo: false`. This removes the "All concepts" button.
2. In `netlify.toml`, uncomment the redirect so `/` opens the chosen concept.
3. Optionally, add contact details in `assets/config.js` (`phone`, `instagram`,
   `address`, `hours`). They appear in the menu footer.

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
  all still in the data and can be switched on in the Manager.

**Please ask the restaurant to check:** *Halabieh*, *Pumpkin Kibbeh* (till: PUMPKIN),
*Chocolate Mousse* (till: CHOCOLA MOU), *Polo Lemonade*, *Whisky Black*, and the Ksara wine
colours (Sunset = rosé, Réserve du Couvent = red, Blanc de Blancs = white).

## Tech notes
- Plain HTML, CSS and JS, with fonts self-hosted in `assets/fonts`. No third-party requests.
- Light mode only, by design (`color-scheme: light`).
- Shared data layer: `assets/menu-core.js`. Icons: `assets/icons.js`.
- `assets/vendor/`: SheetJS (reads the Excel file in the Manager) and qrcode-generator.
