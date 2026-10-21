# 05 · Message to the reviewer

Paste into **Message to the reviewer** (not public). Keep it short and factual.
Use **A** when Occasion 2.0 updates the existing Occasion item, **B** when it is submitted as a new item.

## A · Update of the existing Occasion item

```
Hello,

This update brings Occasion to version 2.0.0, a complete rebuild for Shopify Online Store 2.0
(the 1.x theme was a 2018 sectioned theme built on jQuery and Slick).

Live preview (all designs): https://iphoenixthemes.com/occasion/
- Occasion (multi-category): https://occasion-demo.myshopify.com/
- Home Fashion #1 (fashion, 5 languages): https://occasion-demo-1.myshopify.com/
- Home Fashion #2 (minimal boutique): https://occasion-demo-2.myshopify.com/
The demo stores have no password.

Main file contents:
- themes/occasion-theme-v2.0.0.zip, occasion-fashion-1-theme-v2.0.0.zip,
  occasion-fashion-2-theme-v2.0.0.zip: one installable theme per design
  (Online Store > Themes > Add theme > Upload zip file).
- documentation/: offline HTML documentation (open documentation/index.html).

Notes for testing:
- Each theme zip passes Shopify Theme Check with 0 errors (checked by the release script).
  JSON templates, sections everywhere and app blocks.
- Shopify features: selling plans, Shop Pay Installments, pickup availability, gift card
  recipient form, unit prices, accelerated checkout (optional), predictive search, filters,
  localization (31 languages, currency / country selector).
- Built-in features (no apps): mega menus, quick view, wishlist and compare pages
  (page.wishlist / page.compare templates), add-to-cart popup, mini cart, bundle discount,
  daily deals, sales popup, newsletter popup, cookie consent.
- No jQuery and no carousel libraries. Dawn (MIT) and Bootstrap grid (MIT) are credited.
- No photos are bundled in the theme files; demo images are not included in the download.
- Description, preview images and changelog are updated for 2.0.

Thank you for your time.
iPhoenix Themes — support@iphoenixthemes.com
```

## B · New item

Same text, with the first paragraph replaced by:

```
Occasion 2.0 is a Shopify Online Store 2.0 theme package with three complete store designs.
It is a full rebuild of our 2018 Occasion theme; this upload is the new 2.0 code base.
```

Remove the FAQ “I bought Occasion 1.x. Do I get 2.0?” from the description in this case.

## Later updates

```
Hello,

Update to version {{VERSION}}:
- {{one line per change, same as the public changelog}}

Theme zips, documentation and changelog are updated. Demo: {{demo URL of the changed design}}.
Thank you.
```

## If a soft rejection comes back

Reply point by point, quoting each remark, then what changed and where (file / page / screenshot).
Re-upload the whole main file, never a partial zip.
