/**
 * Print Shopify schema "options" array from scripts/data/svg-icons.json.
 * Usage: node scripts/generate-svg-icon-schema-options.js
 * Paste output into section {% schema %} select settings (see scripts/data/tm-icon-picker.json).
 */
const path = require('path');
const icons = require(path.join(__dirname, './data/svg-icons.json')).icons;

const options = icons.map(({ id, label }) => ({
  value: id,
  label,
}));

console.log(JSON.stringify(options, null, 2));
