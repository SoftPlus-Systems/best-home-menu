/* Line icons (24×24, stroke = currentColor). Used for categories and UI. */
(function () {
  const P = {
    starters: '<path d="M6 10h12l-1.6 10.2a1 1 0 0 1-1 .8H8.6a1 1 0 0 1-1-.8z"/><path d="M8.3 10 7.6 4.5M10.8 10V3.5M13.3 10V4M15.8 10l.7-5"/>',
    salad: '<path d="M3 12h18a9 8 0 0 1-18 0z"/><path d="M8 12c0-3.3 2.2-5.6 5.5-5.6 0 3.3-2.2 5.6-5.5 5.6"/><path d="M13 12c.8-1.9 2.6-3.1 4.8-3.1"/>',
    pizza: '<path d="M12 21 3.4 6.6a15.5 15.5 0 0 1 17.2 0z"/><path d="M5.2 9.5a12.4 12.4 0 0 1 13.6 0"/><circle cx="10" cy="12" r="1.1"/><circle cx="14" cy="13.3" r="1.1"/><circle cx="12" cy="16.6" r=".9"/>',
    burger: '<path d="M4 11a8 6.5 0 0 1 16 0z"/><path d="M3.5 14c1.4 1 2.8 1 4.2 0s2.8-1 4.3 0 2.8 1 4.2 0 2.9-1 4.3 0"/><path d="M4.5 17.3h15v.4a2.3 2.3 0 0 1-2.3 2.3H6.8a2.3 2.3 0 0 1-2.3-2.3z"/>',
    sub: '<rect x="2.5" y="8" width="19" height="8.5" rx="4.2"/><path d="M5.5 12.2c1.5-1 3 1 4.5 0s3 1 4.5 0 3 1 4.5 0"/>',
    combo: '<path d="M13.5 8.5h7l-1.1 11.7a1 1 0 0 1-1 .8h-2.8a1 1 0 0 1-1-.8z"/><path d="m17 8.5 1-5h2.2"/><path d="M3.5 13h7.5l-.9 6.9a1.3 1.3 0 0 1-1.3 1.1H5.7a1.3 1.3 0 0 1-1.3-1.1z"/><path d="m5.5 13-.5-4.5M7.3 13V8m1.8 5 .6-4.5"/>',
    platter: '<path d="M2.5 18h19"/><path d="M4.5 18a7.5 7.5 0 0 1 15 0"/><path d="M12 10.5V8.3M10.5 8h3"/><path d="M4 21h16"/>',
    pasta: '<path d="M3 13h18a9 7.5 0 0 1-18 0z"/><path d="M7.5 13c0-2.2 1.1-3.5 2.3-3.5s2.2 1.3 2.2 3.5m0 0c0-2.2 1.1-3.5 2.3-3.5s2.2 1.3 2.2 3.5"/><path d="M15 3.5 12.5 9"/><path d="m18 4-4 5.5"/>',
    dessert: '<path d="M3.5 11 17 5.5l3.5 5.5"/><path d="M3.5 11h17v8.5h-17z"/><path d="M3.5 15h17"/><circle cx="17.5" cy="3.4" r="1.3"/>',
    coffee: '<path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M8 2.8c-.9.9.9 2 0 3.2M12 2.8c-.9.9.9 2 0 3.2"/><path d="M3 21.5h15"/>',
    iced: '<path d="M6 8.5h12"/><path d="m7 8.5 1.2 12.5h7.6L17 8.5"/><path d="M7.2 8.5a4.8 3.2 0 0 1 9.6 0"/><path d="m12.5 5.4 2.2-3.6h2"/><rect x="9" y="11.5" width="3" height="3" rx=".5"/><rect x="12.3" y="14.6" width="3" height="3" rx=".5"/>',
    mocktail: '<path d="M4 5h16l-8 8.5z"/><path d="M12 13.5V20m-4 1h8"/><path d="m14.5 2-3.2 6"/><circle cx="18.5" cy="4.2" r="2.4"/>',
    juice: '<path d="M6 5h12l-1.5 15.2a1 1 0 0 1-1 .8h-7a1 1 0 0 1-1-.8z"/><path d="M6.7 11.5h10.6"/><path d="m13.5 5 2.3-3.3h2"/>',
    soda: '<rect x="7" y="4" width="10" height="17" rx="2.2"/><path d="M7 7.5h10M7 17.5h10M10 2.2h4"/>',
    beer: '<path d="M5 8.5h10V19a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/><path d="M15 10.5h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2"/><path d="M4.8 8.5a2.4 2.4 0 0 1 2.7-3.2 3 3 0 0 1 5 0 2.4 2.4 0 0 1 2.7 3.2"/><path d="M8.3 11.5v6.5m3.4-6.5v6.5"/>',
    wine: '<path d="M7.5 3h9l.5 5a5 5 0 0 1-10 0z"/><path d="M7.2 7.2h9.6"/><path d="M12 13v7.5m-3.5.5h7"/>',
    spirits: '<path d="M10 2h4v4l2.2 3.2V20a2 2 0 0 1-2 2H9.8a2 2 0 0 1-2-2V9.2L10 6z"/><path d="M7.8 12h8.4v5H7.8z"/>',
    arguileh: '<path d="M9 2.5h6l-1 2.3h-4z"/><path d="M8 7h8M12 4.8v8"/><path d="M8.6 21a4.3 4.3 0 1 1 6.8 0z"/><path d="M15 15.5c3.5 0 5.5 1.3 5.5 4.3"/>',
    plus: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8m-4-4h8"/>',
    // UI
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.9-3.9"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    chevron: '<path d="m9 5 7 7-7 7"/>',
    up: '<path d="m5 15 7-7 7 7"/>',
    star: '<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    print: '<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    insta: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r=".6"/>',
  };

  window.BH_ICON = function (name, cls) {
    const body = P[name] || P.plus;
    return '<svg class="' + (cls || "ico") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + "</svg>";
  };
  window.BH_ICON_NAMES = Object.keys(P);
})();
