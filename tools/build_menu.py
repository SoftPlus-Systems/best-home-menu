"""
Turn the raw POS export (data/pos-export.xlsx) into the customer-facing menu
(data/menu.json + data/menu.csv).

The POS names are short, upper-case till labels ("HAMB+POT+PEP", "WHISKY
REGULAR (1/4)") and the export also contains staff meals, "work" items and
duplicates. This script keeps the POS item code as the link between the two,
and applies a curated mapping:

    code -> (display name, option/size, category, extra)

Rows that share the same name + category are shown as one dish with several
sizes (e.g. Whisky: Glass / 1/4 / 1/2 / Bottle).

Any POS code NOT in the mapping is imported as hidden, so new till items show up
in the Menu Manager where they can be switched on.

Usage:  python3 tools/build_menu.py
"""
import csv
import json
import pathlib

import openpyxl

ROOT = pathlib.Path(__file__).resolve().parent.parent

CATEGORIES = [
    ("starters", "Starters", "starters"),
    ("salads", "Salads", "salad"),
    ("pizza", "Pizza & Manakish", "pizza"),
    ("sandwiches", "Sandwiches & Burgers", "burger"),
    ("subs", "Submarines", "sub"),
    ("combos", "Combo Meals", "combo"),
    ("platters", "Platters", "platter"),
    ("pasta", "Pasta", "pasta"),
    ("desserts", "Desserts", "dessert"),
    ("hot", "Hot Drinks", "coffee"),
    ("iced", "Iced Coffee & Matcha", "iced"),
    ("mocktails", "Mocktails", "mocktail"),
    ("juices", "Fresh Juices & Shakes", "juice"),
    ("soft", "Soft Drinks & Water", "soda"),
    ("beer", "Beer", "beer"),
    ("wine", "Wine", "wine"),
    ("spirits", "Spirits", "spirits"),
    ("arguileh", "Arguileh", "arguileh"),
    ("extras", "Extras & Add-ons", "plus"),
]

S = "signature"

# code: (name, option, category[, description][, tags])
MAP = {
    # ---- Starters
    "11": ("Garlic Bread", "", "starters"),
    "12": ("Spring Rolls", "", "starters"),
    "13": ("French Fries", "Small", "starters"),
    "14": ("French Fries", "Plate", "starters"),
    "347": ("Potato Wedges", "", "starters"),
    "395": ("Potato Wedges with Cheddar", "", "starters"),
    "322": ("Spicy Potatoes", "", "starters"),
    "15": ("Baked Potato", "", "starters"),
    "16": ("Cheese Rolls", "", "starters"),
    "20": ("Sambousek", "", "starters"),
    "180": ("Spinach Pie", "", "starters"),
    "181": ("Pumpkin Kibbeh", "", "starters"),
    "17": ("Hommos", "", "starters"),
    "173": ("Hommos with Awarma", "", "starters"),
    "113": ("Moutabal", "", "starters"),
    "183": ("Mhammara", "", "starters"),
    "182": ("Eggplant Msakaa", "", "starters"),
    "132": ("Grape Leaves", "", "starters"),
    "18": ("Foul Moudammas", "", "starters", "Served with fresh vegetables"),
    "385": ("Labneh", "", "starters"),
    "386": ("Cheese Plate", "", "starters"),
    "384": ("Eggs", "3 eggs", "starters"),
    "19": ("Halabieh", "", "starters"),
    "342": ("Chicken Nuggets", "4 pcs", "starters"),
    "341": ("Chicken Crispy", "4 pcs", "starters"),
    "348": ("Mozzarella Sticks", "5 pcs", "starters"),
    "369": ("Grilled Halloumi", "4 pcs", "starters"),
    "179": ("Calamari", "4 pcs", "starters"),
    "125": ("Termos", "", "starters", "Lupini beans"),
    "126": ("Carrot Sticks", "", "starters"),
    "23": ("Mixed Nuts", "Regular", "starters"),
    "24": ("Mixed Nuts", "Large", "starters"),
    # ---- Salads
    "1": ("Caesar Salad", "", "salads"),
    "2": ("Fattoush", "Large", "salads"),
    "153": ("Fattoush", "Small", "salads"),
    "161": ("Tabbouleh", "Large", "salads"),
    "340": ("Tabbouleh", "Small", "salads"),
    "3": ("Greek Salad", "", "salads"),
    "154": ("Oriental Salad", "", "salads"),
    "5": ("Chef Salad", "", "salads"),
    "7": ("Panaché Salad", "", "salads"),
    "4": ("Tuna Salad", "", "salads"),
    "390": ("Crab Salad", "", "salads"),
    "337": ("Quinoa Salad", "", "salads"),
    "331": ("Kale Salad", "", "salads"),
    "377": ("Chicken Kale Salad", "", "salads"),
    "339": ("Rocca Salad", "", "salads"),
    "351": ("Rocca & Halloumi", "", "salads"),
    "9": ("Russian Salad", "", "salads"),
    "10": ("Coleslaw", "", "salads"),
    "372": ("Vegetable Plate", "", "salads"),
    # ---- Pizza & Manakish
    "30": ("Best Pizza", "", "pizza", "Our house pizza", [S]),
    "155": ("Margherita Pizza", "", "pizza"),
    "26": ("Classic Pizza", "", "pizza"),
    "25": ("Vegetarian Pizza", "", "pizza"),
    "28": ("Pepperoni Pizza", "", "pizza"),
    "156": ("Chicken Pizza", "", "pizza"),
    "338": ("Mexican Chicken Pizza", "", "pizza"),
    "29": ("Tuna Pizza", "", "pizza"),
    "349": ("Pesto Pizza", "", "pizza"),
    "350": ("Fig & Feta Pizza", "", "pizza"),
    "330": ("Hot Dog Pizza", "", "pizza"),
    "21": ("Manakish Zaatar", "", "pizza"),
    "22": ("Manakish Cheese", "", "pizza"),
    "370": ("Manakish Labneh & Zaatar", "", "pizza"),
    "329": ("Mhammara & Cheese", "", "pizza"),
    # ---- Sandwiches & Burgers
    "36": ("Hamburger", "", "sandwiches"),
    "38": ("Cheeseburger", "", "sandwiches"),
    "39": ("Chicken Burger", "", "sandwiches"),
    "376": ("Chicken Breast Burger", "", "sandwiches"),
    "393": ("Zinger Burger", "", "sandwiches"),
    "334": ("Mexican Chicken Burger", "", "sandwiches"),
    "335": ("Mexican Beef Burger", "", "sandwiches"),
    "37": ("Fish Burger", "", "sandwiches"),
    "32": ("Tawouk Sandwich", "", "sandwiches"),
    "33": ("Kafta Sandwich", "", "sandwiches"),
    "34": ("Fajita Sandwich", "", "sandwiches"),
    "392": ("Philadelphia Sandwich", "", "sandwiches"),
    "387": ("Meat Sandwich", "", "sandwiches"),
    "31": ("Hot Dog Sandwich", "", "sandwiches"),
    "35": ("Potato Sandwich", "", "sandwiches"),
    # ---- Subs
    "42": ("Best Sub", "", "subs", "Our house submarine", [S]),
    "40": ("Chicken Sub", "", "subs"),
    "41": ("Tuna Sub", "", "subs"),
    # ---- Combos
    "411": ("Burger Combo", "", "combos", "Hamburger, fries & Pepsi"),
    "413": ("Chicken Burger Combo", "", "combos", "Chicken burger, fries & Pepsi"),
    "414": ("Tawouk Combo", "", "combos", "Tawouk sandwich, fries & a drink"),
    "314": ("Chicken Sandwich Meal", "", "combos"),
    "415": ("Nuggets Combo", "", "combos", "Chicken nuggets, fries & Pepsi"),
    "410": ("Pizza Combo", "", "combos", "Pizza & Pepsi"),
    # ---- Platters
    "53": ("Mixed Grill", "", "platters"),
    "323": ("Grilled Meat", "", "platters"),
    "54": ("Grilled Steak", "", "platters"),
    "55": ("Steak au Poivre", "", "platters"),
    "56": ("Filet Mignon", "", "platters"),
    "51": ("Mexican Steak", "", "platters"),
    "43": ("Beef Escalope", "", "platters"),
    "45": ("Beef Cordon Bleu", "", "platters"),
    "44": ("Chicken Escalope", "", "platters"),
    "320": ("Chicken Cordon Bleu", "", "platters"),
    "49": ("Chicken Kiev", "", "platters"),
    "50": ("Chicken Filet", "", "platters"),
    "378": ("Mexican Chicken Filet", "", "platters"),
    "327": ("Chicken Mustard", "", "platters"),
    "328": ("Chicken Cream Sauce", "", "platters"),
    "48": ("Tawouk Plate", "", "platters"),
    "58": ("Fajita Plate", "", "platters"),
    "172": ("Crispy Plate", "", "platters"),
    "394": ("Zinger Plate", "", "platters"),
    "418": ("Philadelphia Plate", "", "platters"),
    "57": ("Chicken Nuggets Plate", "", "platters"),
    "46": ("Hamburger Plate", "", "platters"),
    "127": ("Cheeseburger Plate", "", "platters"),
    "128": ("Chicken Burger Plate", "", "platters"),
    "47": ("Fish Burger Plate", "", "platters"),
    "52": ("Fish Filet", "", "platters"),
    "379": ("Calamari Plate", "", "platters"),
    # ---- Pasta
    "343": ("Penne Arrabbiata", "", "pasta"),
    "178": ("Pasta Alfredo", "", "pasta"),
    "157": ("Chicken Alfredo", "", "pasta"),
    "177": ("Pesto Pasta", "", "pasta"),
    "345": ("Creamy Pesto Pasta", "", "pasta"),
    "408": ("Chicken Pesto Pasta", "", "pasta"),
    # ---- Desserts
    "426": ("Tiramisu", "", "desserts"),
    "420": ("Cheesecake", "", "desserts"),
    "174": ("Chocolate Fondant", "", "desserts"),
    "422": ("Brownie", "", "desserts"),
    "104": ("Cake", "", "desserts"),
    "421": ("Waffle", "", "desserts"),
    "423": ("Pancakes", "", "desserts"),
    "417": ("Pain Perdu", "", "desserts"),
    "169": ("Chocolate Crêpe", "", "desserts"),
    "309": ("Special Crêpe", "", "desserts"),
    "381": ("Chocolate Banana Roll", "", "desserts"),
    "162": ("Chocolate Mousse", "", "desserts"),
    "160": ("Banana Split", "", "desserts"),
    "356": ("Affogato", "", "desserts"),
    "105": ("Ice Cream", "Per scoop", "desserts"),
    "326": ("Layali Lebnan", "", "desserts"),
    "108": ("Mhalabieh", "", "desserts"),
    "110": ("Meghli", "", "desserts"),
    "109": ("Custard", "", "desserts"),
    "103": ("Jello", "", "desserts"),
    "107": ("Fruit Salad", "", "desserts"),
    "130": ("Mixed Fruit", "", "desserts"),
    # ---- Hot drinks
    "310": ("Espresso", "Single", "hot"),
    "457": ("Espresso", "Double", "hot"),
    "450": ("Americano", "", "hot"),
    "456": ("Lebanese Coffee", "", "hot"),
    "99": ("Nescafé", "", "hot"),
    "100": ("Cappuccino", "", "hot"),
    "434": ("Flat White", "", "hot"),
    "451": ("Latte", "", "hot"),
    "453": ("Spanish Latte", "", "hot"),
    "454": ("Coconut Latte", "", "hot"),
    "455": ("Banana Latte", "", "hot"),
    "452": ("Mocha Latte", "", "hot"),
    "467": ("Sweet Matcha", "", "hot"),
    "101": ("Hot Chocolate", "", "hot"),
    "484": ("Tea", "", "hot"),
    "97": ("Zhourat", "", "hot", "Lebanese herbal infusion"),
    # ---- Iced coffee & matcha
    "458": ("Iced Americano", "", "iced"),
    "459": ("Iced Latte", "", "iced"),
    "353": ("Iced Vanilla Latte", "", "iced"),
    "354": ("Iced Caramel Latte", "", "iced"),
    "460": ("Iced Spanish Latte", "", "iced"),
    "461": ("Iced Coconut Latte", "", "iced"),
    "462": ("Iced Banana Latte", "", "iced"),
    "469": ("Iced Mocha Latte", "", "iced"),
    "466": ("Iced Honey Latte", "", "iced"),
    "463": ("Iced Baklava Latte", "", "iced", "", [S]),
    "464": ("Iced Mhalabiya Latte", "", "iced", "", [S]),
    "465": ("Iced Date Latte", "", "iced", "", [S]),
    "430": ("Caramel Frappuccino", "", "iced"),
    "429": ("Iced Matcha", "", "iced"),
    "468": ("Iced Sweet Matcha", "", "iced"),
    # ---- Mocktails
    "470": ("Sunset", "", "mocktails"),
    "471": ("Dragon Fizz", "", "mocktails"),
    "475": ("Indigo", "", "mocktails"),
    "476": ("Blue Lagoon", "", "mocktails"),
    "474": ("Tropical Spritz", "", "mocktails"),
    "424": ("Mojito", "", "mocktails"),
    "472": ("Wild Berry Mojito", "", "mocktails"),
    "473": ("Kiwi Mojito", "", "mocktails"),
    "433": ("Mixed Berries Tropical", "", "mocktails"),
    # ---- Juices & shakes
    "483": ("Orange Juice", "", "juices"),
    "92": ("Carrot Juice", "", "juices"),
    "409": ("Fresh Apple Juice", "", "juices"),
    "158": ("Strawberry Juice", "Small", "juices"),
    "93": ("Strawberry Juice", "Large", "juices"),
    "90": ("Lemonade", "", "juices"),
    "166": ("Polo Lemonade", "", "juices"),
    "117": ("Fruit Cocktail", "", "juices"),
    "308": ("Avocado Cocktail", "", "juices"),
    "432": ("Smoothie", "", "juices"),
    "94": ("Banana Milkshake", "", "juices"),
    "159": ("Strawberry Milkshake", "", "juices"),
    # ---- Soft drinks & water
    "481": ("Soft Drink", "", "soft"),
    "477": ("Iced Tea", "Peach", "soft"),
    "478": ("Iced Tea", "Lemon", "soft"),
    "163": ("Lipton Ice Tea", "", "soft"),
    "482": ("Red Bull", "", "soft"),
    "406": ("Bom Bom", "", "soft"),
    "407": ("Dark Blue", "", "soft"),
    "371": ("Mr Juice", "", "soft"),
    "479": ("Water", "Small", "soft"),
    "480": ("Sparkling Water", "", "soft"),
    "95": ("Perrier", "", "soft"),
    "380": ("Tonic Water", "", "soft"),
    # ---- Beer
    "59": ("Local Beer", "", "beer"),
    "63": ("Imported Beer", "", "beer"),
    "60": ("Mexican Beer", "", "beer"),
    "186": ("Laziza", "", "beer", "Non-alcoholic"),
    # ---- Wine
    "324": ("House Wine", "Glass", "wine"),
    "74": ("House Wine", "½ Bottle", "wine"),
    "75": ("House Wine", "Bottle", "wine"),
    "362": ("Ksara Sunset", "Glass", "wine", "Rosé"),
    "360": ("Ksara Sunset", "½ Bottle", "wine"),
    "361": ("Ksara Sunset", "Bottle", "wine"),
    "363": ("Ksara Réserve du Couvent", "Glass", "wine", "Red"),
    "364": ("Ksara Réserve du Couvent", "½ Bottle", "wine"),
    "365": ("Ksara Réserve du Couvent", "Bottle", "wine"),
    "366": ("Ksara Blanc de Blancs", "Glass", "wine", "White"),
    "367": ("Ksara Blanc de Blancs", "½ Bottle", "wine"),
    "368": ("Ksara Blanc de Blancs", "Bottle", "wine"),
    # ---- Spirits
    "76": ("Arak", "Glass", "spirits"),
    "77": ("Arak", "¼ Bottle", "spirits"),
    "78": ("Arak", "½ Bottle", "spirits"),
    "79": ("Arak", "Bottle", "spirits"),
    "80": ("Arak Extra", "Glass", "spirits"),
    "81": ("Arak Extra", "¼ Bottle", "spirits"),
    "82": ("Arak Extra", "½ Bottle", "spirits"),
    "83": ("Arak Extra", "Bottle", "spirits"),
    "66": ("Whisky", "Glass", "spirits"),
    "67": ("Whisky", "¼ Bottle", "spirits"),
    "68": ("Whisky", "½ Bottle", "spirits"),
    "69": ("Whisky", "Bottle", "spirits"),
    "70": ("Whisky Black", "Glass", "spirits"),
    "71": ("Whisky Black", "¼ Bottle", "spirits"),
    "72": ("Whisky Black", "½ Bottle", "spirits"),
    "73": ("Whisky Black", "Bottle", "spirits"),
    "114": ("Vodka", "Glass", "spirits"),
    "115": ("Vodka", "½ Bottle", "spirits"),
    "116": ("Vodka", "Bottle", "spirits"),
    "64": ("Gin", "Glass", "spirits"),
    # ---- Arguileh
    "84": ("Arguileh", "Classic", "arguileh"),
    "405": ("Arguileh", "Nakhla", "arguileh"),
    "164": ("Arguileh Head Change", "", "arguileh"),
    "321": ("Disposable Hose", "", "arguileh"),
    # ---- Extras
    "488": ("Extra Espresso Shot", "", "extras"),
    "486": ("Almond Milk", "", "extras"),
    "485": ("Skimmed / Lactose-free Milk", "", "extras"),
    "487": ("Flavoured Syrup", "", "extras"),
    "489": ("Decaf Coffee", "", "extras"),
    "325": ("Extra Sauce", "", "extras"),
}

# POS family -> category for anything unmapped (imported hidden)
FAMILY = {
    "STARTERS": "starters", "SALADS": "salads", "PIZZA": "pizza",
    "SANDWICHES": "sandwiches", "SUBMARINES": "subs", "PLATTERS": "platters",
    "ALCOHOLS": "spirits", "ARGUILEH": "arguileh", "COLD BEVERAGES": "soft",
    "HOT BEVERAGES": "hot", "DESSERTS": "desserts", "KITCHEN": "extras",
}


def main():
    wb = openpyxl.load_workbook(ROOT / "data" / "pos-export.xlsx", read_only=True)
    ws = wb.active
    rows = list(ws.iter_rows(values_only=True))[1:]
    pos = {str(r[0]).strip(): r for r in rows if r and r[0] is not None}

    items = []
    # visible items, in curated order
    for code, spec in MAP.items():
        if code not in pos:
            raise SystemExit(f"code {code} missing from POS export")
        name, option, cat = spec[:3]
        desc = spec[3] if len(spec) > 3 else ""
        tags = spec[4] if len(spec) > 4 else []
        items.append(dict(code=code, name=name, option=option,
                          price=round(float(pos[code][2] or 0), 2),
                          category=cat, description=desc, tags=tags,
                          visible=True))
    # everything else: hidden (staff meals, duplicates, internal till keys)
    for code, r in pos.items():
        if code in MAP:
            continue
        items.append(dict(code=code, name=str(r[1]).strip().title(), option="",
                          price=round(float(r[2] or 0), 2),
                          category=FAMILY.get(str(r[4]).strip(), "extras"),
                          description="", tags=[], visible=False))

    menu = {
        "restaurant": {"name": "Best Home", "tagline": "Food · Coffee · Drinks",
                       "currency": "USD", "note": "Prices in USD."},
        "categories": [dict(id=i, name=n, icon=ic) for i, n, ic in CATEGORIES],
        "items": items,
    }
    (ROOT / "data" / "menu.json").write_text(
        json.dumps(menu, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    cat_name = {i: n for i, n, _ in CATEGORIES}
    with open(ROOT / "data" / "menu.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["code", "category", "name", "option", "price",
                    "description", "tags", "visible"])
        for it in items:
            w.writerow([it["code"], cat_name[it["category"]], it["name"],
                        it["option"], it["price"], it["description"],
                        " ".join(it["tags"]), "yes" if it["visible"] else "no"])

    vis = sum(i["visible"] for i in items)
    print(f"{len(items)} POS items -> {vis} visible, {len(items) - vis} hidden")


if __name__ == "__main__":
    main()
