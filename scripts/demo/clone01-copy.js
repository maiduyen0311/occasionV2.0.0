// Product copy for the clone01 demo (Home Fashion #1): short description (card list view,
// product page under the price — metafield custom.short_description and first paragraph of
// the description), feature list and composition. Care text comes from the product type.
// [short description, [details…], composition]

const COPY = {
  'rainbow-stripe-crop-t-shirt': ['A cropped cotton T-shirt with a rainbow stripe across the chest. Easy to pair with high-waisted jeans or a denim skirt.', ['Round neck', 'Short sleeves', 'Cropped length', 'Rainbow stripe print'], '100% cotton'],
  'red-bow-bardot-top': ['Off-the-shoulder top with a statement bow at the front and gathered sleeves — made for summer evenings.', ['Bardot neckline with elastic', 'Decorative bow detail', 'Short puff sleeves', 'Relaxed fit'], '65% polyester, 35% viscose'],
  'green-knit-sweater': ['A soft ribbed knit in a fresh green shade with dropped shoulders for an easy, relaxed shape.', ['Round neck', 'Long sleeves with dropped shoulders', 'Ribbed trims', 'Regular fit'], '50% acrylic, 30% polyamide, 20% wool'],
  'pink-pompom-scarf': ['A cosy knit scarf finished with fluffy pompoms at each end.', ['Fine knit', 'Pompom trims', 'Length 180 cm, width 30 cm'], '100% acrylic'],
  'colour-block-hoodie': ['A colour block hoodie in brushed fleece with a kangaroo pocket and drawstring hood.', ['Adjustable drawstring hood', 'Kangaroo pocket', 'Ribbed cuffs and hem', 'Colour block panels'], '60% cotton, 40% polyester'],
  'fringed-block-heel-sandals': ['Block heel sandals with a fringed strap and an adjustable buckle at the ankle.', ['Fringed front strap', 'Buckle ankle fastening', 'Heel height 7 cm', 'Padded insole'], 'Upper: polyurethane. Sole: thermoplastic rubber'],
  'gold-chain-link-earrings': ['Statement drop earrings made from chunky gold-tone chain links.', ['Push-back fastening', 'Drop length 5.5 cm', 'Nickel free'], 'Zinc alloy, gold-tone plating'],
  'round-mirrored-sunglasses': ['Round sunglasses with mirrored lenses and a thin metal frame.', ['Mirrored lenses', 'UV400 protection', 'Adjustable nose pads', 'Includes a soft pouch'], 'Frame: metal. Lenses: polycarbonate'],
  'pompom-knit-beanie': ['A chunky knit beanie with a turned-up brim and a faux fur pompom.', ['Turn-up brim', 'Faux fur pompom', 'One size, stretchy fit'], '100% acrylic'],
  'ankle-strap-platform-sandals': ['Platform sandals with a slim ankle strap and a stable block heel — comfortable from day to night.', ['Platform sole', 'Block heel, 10 cm (3 cm platform)', 'Buckle ankle strap', 'Padded insole'], 'Upper: polyurethane. Sole: thermoplastic rubber'],
  'mustard-silk-scarf': ['A lightweight satin-feel scarf in mustard with a delicate print. Wear it around the neck, in the hair or on a bag.', ['Square shape, 70 × 70 cm', 'Printed design', 'Rolled edges'], '100% polyester satin'],
  'ruffled-wrap-blouse': ['A floaty wrap blouse with ruffled trims and a tie at the waist.', ['V-neck wrap front', 'Ruffle trims', 'Tie waist', 'Long sleeves with elastic cuffs'], '100% viscose'],
  'tropical-print-bikini-bottoms': ['High-cut bikini bottoms in a bold tropical print with side ties.', ['Tie sides', 'High-cut leg', 'Fully lined'], '82% polyamide, 18% elastane. Lining: 100% polyester'],
  'button-front-mini-skirt': ['A-line mini skirt with a row of buttons down the front and a high waist.', ['High waist', 'Button front', 'A-line shape', 'Mini length'], '98% cotton, 2% elastane'],
  'floral-tie-front-crop-top': ['A cropped top in a small floral print with a knot at the front.', ['Square neck', 'Tie front', 'Short sleeves', 'Cropped length'], '100% viscose'],
  'ribbed-washed-beanie': ['A soft ribbed beanie with a washed finish and a deep cuff.', ['Ribbed knit', 'Washed effect', 'One size'], '100% acrylic'],
  'yellow-faux-leather-belt-bag': ['A compact belt bag in yellow faux leather — wear it at the waist or across the body.', ['Adjustable belt strap', 'Zip fastening', 'Inner pocket', '22 × 13 × 6 cm'], 'Polyurethane. Lining: 100% polyester'],
  'metal-frame-round-sunglasses': ['Retro round sunglasses with a thin metal frame and tinted lenses.', ['Tinted lenses', 'UV400 protection', 'Adjustable nose pads'], 'Frame: metal. Lenses: polycarbonate'],
  'bell-sleeve-crochet-top': ['A crochet knit top with wide bell sleeves — a summer layer over a bikini or a camisole.', ['Round neck', 'Bell sleeves', 'Open crochet knit', 'Relaxed fit'], '100% cotton'],
  'tropical-print-tie-shirt': ['A short sleeve shirt in a tropical print that ties at the hem.', ['Notched collar', 'Button front', 'Tie hem', 'Short sleeves'], '100% viscose'],
  'woven-tote-bag': ['A large woven tote with sturdy handles — big enough for the beach or the market.', ['Two shoulder handles', 'Open top with magnetic snap', 'Inner pocket', '45 × 32 × 14 cm'], 'Paper straw. Lining: 100% cotton'],
  'denim-cami-crop-top': ['A cropped denim cami with thin adjustable straps and a straight neckline.', ['Adjustable straps', 'Straight neckline', 'Back zip', 'Cropped length'], '100% cotton denim'],
  'olive-pointed-stilettos': ['Pointed stilettos in olive faux suede — an easy way to add colour to any outfit.', ['Pointed toe', 'Stiletto heel, 9 cm', 'Padded insole'], 'Upper: polyester faux suede. Sole: thermoplastic rubber'],
  'enamel-triangle-earrings': ['Geometric drop earrings with enamel triangles in warm tones.', ['Hook fastening', 'Drop length 6 cm', 'Nickel free'], 'Zinc alloy, enamel'],
  'yellow-short-sleeve-shirt': ['A relaxed short sleeve shirt in sunny yellow with a camp collar.', ['Camp collar', 'Button front', 'Chest pocket', 'Short sleeves'], '55% linen, 45% cotton'],
  'hug-me-tender-t-shirt': ['A soft cotton T-shirt with a "Hug me tender" slogan print.', ['Round neck', 'Short sleeves', 'Front slogan print', 'Regular fit'], '100% cotton'],
  'mustard-striped-top': ['A fitted striped top in mustard and white with long sleeves.', ['Round neck', 'Long sleeves', 'Stripe pattern', 'Slim fit'], '95% cotton, 5% elastane'],
  'sporty-stripe-crop-top': ['A sporty crop top with contrast stripes on the sleeves.', ['Round neck', 'Short sleeves with stripes', 'Cropped length'], '100% cotton'],
  'mustard-tie-front-bodysuit': ['A stretch bodysuit in mustard with a tie detail at the front.', ['V-neck', 'Tie front', 'Long sleeves', 'Press-stud fastening'], '92% polyester, 8% elastane'],
  'yellow-tube-mini-skirt': ['A stretchy tube mini skirt in bright yellow.', ['Elastic waist', 'Fitted shape', 'Mini length'], '95% polyester, 5% elastane'],
  'mustard-buttoned-mini-skirt': ['A corduroy-look mini skirt with a button front and two pockets.', ['High waist', 'Button front', 'Front pockets', 'A-line shape'], '100% cotton'],
  'pink-knit-mini-skirt': ['A fine-knit mini skirt in soft pink — wear it with the matching knit for a co-ord look.', ['Elastic waist', 'Fine knit', 'Fitted shape'], '70% viscose, 30% polyamide'],
  'buttoned-denim-midi-skirt': ['A midi denim skirt with a full button front and a raw hem.', ['High waist', 'Button front', 'Five pockets', 'Midi length'], '100% cotton denim'],
  'checked-flannel-shirt': ['A brushed flannel shirt in a classic red check, worn on its own or open over a tee.', ['Shirt collar', 'Button front', 'Two chest pockets', 'Long sleeves with button cuffs'], '100% cotton flannel'],
  'rust-cable-knit-sweater': ['A warm cable knit sweater in rust with a round neck.', ['Cable knit front', 'Round neck', 'Ribbed trims', 'Relaxed fit'], '60% acrylic, 30% polyamide, 10% wool'],
  'block-stripe-sweater': ['A soft sweater with wide block stripes in earthy tones.', ['Round neck', 'Long sleeves', 'Block stripes', 'Relaxed fit'], '70% acrylic, 30% polyamide'],
  'cream-chunky-knit-sweater': ['An oversized chunky knit in cream — the cosy layer for cold days.', ['High neck', 'Chunky knit', 'Dropped shoulders', 'Oversized fit'], '55% acrylic, 40% polyamide, 5% wool'],
  'danville-varsity-sweatshirt': ['A varsity sweatshirt with a "Danville" print on the front and a brushed inside.', ['Round neck', 'Front print', 'Ribbed trims', 'Brushed lining'], '65% cotton, 35% polyester'],
  'yellow-corduroy-trousers': ['High-waisted corduroy trousers in yellow with a straight leg.', ['High waist', 'Zip and button fastening', 'Straight leg', 'Side pockets'], '98% cotton, 2% elastane'],
  'pineapple-print-denim-shorts': ['Denim shorts with an all-over pineapple print and turn-up hems.', ['High waist', 'Five pockets', 'Turn-up hems'], '100% cotton denim'],
  'ripped-denim-mini-skirt': ['A denim mini skirt with ripped details and a frayed hem.', ['High waist', 'Five pockets', 'Ripped details', 'Frayed hem'], '100% cotton denim'],
  'rainbow-stripe-sweatshirt': ['A cosy sweatshirt with a rainbow stripe across the chest and sleeves.', ['Round neck', 'Rainbow stripes', 'Ribbed trims'], '60% cotton, 40% polyester'],
  'pink-faux-leather-backpack': ['A small backpack in pink faux leather with a drawstring top and flap.', ['Adjustable straps', 'Drawstring and flap closure', 'Front pocket', '28 × 22 × 12 cm'], 'Polyurethane. Lining: 100% polyester'],
  'quilted-belt-bag': ['A quilted belt bag with a gold-tone zip and an adjustable strap.', ['Quilted finish', 'Zip fastening', 'Adjustable strap', '20 × 12 × 5 cm'], 'Polyurethane. Lining: 100% polyester'],
  'chunky-sole-trainers': ['Chunky trainers with a thick sole and mixed panels.', ['Lace-up fastening', 'Padded collar', 'Chunky sole, 5 cm'], 'Upper: polyurethane and textile. Sole: rubber'],
  'track-sole-lace-up-shoes': ['Lace-up shoes on a chunky track sole with a smooth finish.', ['Lace-up fastening', 'Track sole, 4 cm', 'Round toe'], 'Upper: polyurethane. Sole: thermoplastic rubber'],
  'basic-coloured-shorts': ['Basic cotton shorts with an elastic waist — an everyday summer essential.', ['Elastic drawstring waist', 'Side pockets', 'Regular fit'], '100% cotton'],
  'bermuda-shorts-with-an-elastic-waistband': ['Knee-length Bermuda shorts with a comfortable elastic waistband.', ['Elastic waist', 'Side pockets', 'Bermuda length'], '100% cotton'],
  'blue-varsity-sweatshirt-with-embroidery': ['A blue varsity sweatshirt with embroidered lettering on the chest.', ['Round neck', 'Embroidered detail', 'Ribbed trims', 'Brushed lining'], '65% cotton, 35% polyester'],
  'cap-with-embroidered-donuts': ['A cotton baseball cap with playful embroidered donuts.', ['Curved peak', 'Embroidered details', 'Adjustable back strap'], '100% cotton'],
  'cropped-t-shirt-with-text': ['A cropped cotton T-shirt with a text print on the front.', ['Round neck', 'Short sleeves', 'Front text print', 'Cropped length'], '100% cotton'],
  'fashion-trainers': ['Clean-looking trainers with a padded collar and a flat sole.', ['Lace-up fastening', 'Padded collar', 'Flat sole'], 'Upper: polyurethane. Sole: rubber'],
  'mustard-yellow-faux-leather-mini-skirt': ['A faux leather mini skirt in mustard with a high waist and a back zip.', ['High waist', 'Back zip', 'Mini length'], 'Polyurethane. Lining: 100% polyester'],
  'nautical-stripe-sweatshirt': ['A nautical stripe sweatshirt in soft cotton fleece.', ['Round neck', 'Breton stripes', 'Ribbed trims'], '70% cotton, 30% polyester'],
  'oversized-chenille-sweater': ['An oversized sweater in super-soft chenille.', ['Round neck', 'Dropped shoulders', 'Oversized fit'], '100% polyester chenille'],
  'oversized-striped-sweatshirt': ['An oversized sweatshirt with bold horizontal stripes.', ['Round neck', 'Stripe pattern', 'Oversized fit'], '65% cotton, 35% polyester'],
  'pacific-republic-hooded-sweatshirt': ['A hooded sweatshirt with a "Pacific Republic" print and a kangaroo pocket.', ['Drawstring hood', 'Kangaroo pocket', 'Front print', 'Ribbed trims'], '60% cotton, 40% polyester'],
  'paradise-multicoloured-striped-top': ['A "Paradise" top with multicoloured stripes and a relaxed fit.', ['Round neck', 'Short sleeves', 'Multicoloured stripes'], '100% cotton'],
  'pine-trees-and-stripes-t-shirt': ['A cotton T-shirt with pine tree graphics and stripes.', ['Round neck', 'Short sleeves', 'Graphic print'], '100% cotton'],
  'rustic-jumpsuit-with-knots': ['A linen-look jumpsuit with knot details on the straps and wide legs.', ['Knotted straps', 'Wide legs', 'Side pockets', 'Back zip'], '55% linen, 45% viscose'],
  'strappy-top-with-central-panel': ['A strappy top with a central contrast panel and a fitted shape.', ['Thin straps', 'Central panel', 'Fitted shape'], '95% cotton, 5% elastane'],
  'stretch-corduroy-trousers': ['Stretch corduroy trousers with a high waist and slim legs.', ['High waist', 'Zip and button fastening', 'Slim leg', 'Five pockets'], '98% cotton, 2% elastane'],
  'striped-swimsuit-with-one-strap': ['A one-shoulder swimsuit in bold stripes.', ['One-shoulder strap', 'Fully lined', 'Moderate coverage'], '82% polyamide, 18% elastane. Lining: 100% polyester'],
  'three-tone-striped-t-shirt': ['A three-tone striped T-shirt in soft cotton.', ['Round neck', 'Short sleeves', 'Three-tone stripes'], '100% cotton'],
  'tropical-print-shorts': ['Flowing shorts in a tropical print with an elastic waist.', ['Elastic waist', 'Side pockets', 'Relaxed fit'], '100% viscose'],
  'varsity-t-shirt-with-panelled-sleeves': ['A varsity T-shirt with contrast panelled sleeves and a chest print.', ['Round neck', 'Contrast sleeves', 'Front print'], '100% cotton'],
  'wandler-hortensia-bag': ['A structured leather shoulder bag with a sculpted silhouette and a magnetic flap.', ['Magnetic flap', 'Adjustable shoulder strap', 'Inner pocket', '26 × 18 × 9 cm'], '100% calf leather. Lining: suede'],
  'white-lace-up-trainers': ['Classic white lace-up trainers with a clean, minimal shape.', ['Lace-up fastening', 'Padded collar', 'Flat sole'], 'Upper: polyurethane. Sole: rubber'],
  'white-platform-trainers': ['White trainers on a platform sole for extra height.', ['Lace-up fastening', 'Platform sole, 4 cm', 'Padded collar'], 'Upper: polyurethane. Sole: rubber'],
};

const CARE = {
  Tops: 'Machine wash at 30°C. Do not tumble dry. Iron at low temperature.',
  Sweaters: 'Hand wash cold or machine wash at 30°C on a wool cycle. Dry flat.',
  Skirts: 'Machine wash at 30°C. Iron at low temperature.',
  Shorts: 'Machine wash at 30°C. Iron at low temperature.',
  Trousers: 'Machine wash at 30°C. Iron at medium temperature.',
  Dresses: 'Machine wash at 30°C on a gentle cycle. Hang to dry.',
  Swimwear: 'Hand wash cold. Rinse after contact with chlorine or salt water. Dry in the shade.',
  Shoes: 'Wipe clean with a damp cloth. Keep away from direct heat.',
  Bags: 'Wipe clean with a soft, dry cloth. Store in its dust bag.',
  Accessories: 'Hand wash cold. Do not tumble dry.',
  Hats: 'Hand wash cold. Dry flat.',
  Jewelry: 'Avoid contact with water, perfume and cosmetics. Store separately.',
  Sunglasses: 'Clean the lenses with the microfibre cloth. Store in the pouch.',
};

// Second sentence of the short description (about 3 lines in the collection list view)
const MORE = {
  Tops: 'Cut from a soft, breathable fabric that keeps its shape wash after wash — dress it up with heels or keep it casual with trainers.',
  Sweaters: 'Warm without the weight, it layers easily over shirts and under coats, and goes with everything from jeans to skirts.',
  Skirts: 'The comfortable fit moves with you all day; style it with a tucked-in tee and trainers, or a blouse and heels for the evening.',
  Shorts: 'Light and comfortable for warm days, they pair easily with a simple tee, a crop top or an oversized shirt.',
  Trousers: 'A comfortable fit that works from the office to the weekend — pair them with a knit, a shirt or a simple tee.',
  Dresses: 'Easy to wear from day to night: add sandals for the beach or heels and a clutch for a summer evening.',
  Swimwear: 'Quick-drying fabric with a comfortable stretch, ready for the pool, the beach and your next holiday.',
  Shoes: 'A cushioned insole keeps them comfortable all day, and the versatile design goes with jeans, dresses and skirts alike.',
  Bags: 'Roomy enough for your phone, wallet, keys and the little extras, with a design that finishes off any outfit.',
  Accessories: 'The finishing touch for a simple outfit — a small piece that adds colour and personality to your look.',
  Hats: 'Comfortable and easy to wear, it keeps you warm on cold days and adds a relaxed touch to any outfit.',
  Jewelry: 'Lightweight and comfortable enough to wear all day, they add a little shine to both casual and evening looks.',
  Sunglasses: 'A lightweight frame for all-day comfort, with lenses that protect your eyes on bright sunny days.',
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function copyFor(handle, type) {
  const c = COPY[handle];
  if (!c) throw new Error(`No product copy for ${handle}`);
  const [lead, details, composition] = c;
  const short = `${lead} ${MORE[type] || MORE.Tops}`;
  const body = [
    `<p>${esc(short)}</p>`,
    '<h5>Details</h5>',
    `<ul>${details.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>`,
    '<h5>Composition &amp; care</h5>',
    `<ul><li>${esc(composition)}</li><li>${esc(CARE[type] || CARE.Tops)}</li></ul>`,
  ].join('');
  return { short, body };
}

module.exports = { copyFor };
