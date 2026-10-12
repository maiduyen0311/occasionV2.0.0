// Shopify money formatting from a shop money format string
// (e.g. "${{amount}} USD", "{{amount_with_comma_separator}}₫").
// The format comes from Liquid: data-money-format="{{ shop.money_with_currency_format | escape }}".

const group = (n, thousands, decimal, decimals) => {
  const [int, frac] = (n / 100).toFixed(decimals).split('.');
  const intPart = int.replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
  return frac ? intPart + decimal + frac : intPart;
};

export function formatMoney(cents, format) {
  const value = Number(cents) || 0;
  const fmt = format || '${{amount}}';
  return fmt.replace(/\{\{\s*(\w+)\s*\}\}/, (_, key) => {
    switch (key) {
      case 'amount_no_decimals': return group(value, ',', '.', 0);
      case 'amount_with_comma_separator': return group(value, '.', ',', 2);
      case 'amount_no_decimals_with_comma_separator': return group(value, '.', ',', 0);
      case 'amount_with_apostrophe_separator': return group(value, "'", '.', 2);
      case 'amount_with_space_separator': return group(value, ' ', ',', 2);
      default: return group(value, ',', '.', 2);
    }
  });
}

// Closest money format declared on (or above) an element, falling back to USD.
export const moneyFormatFor = (el) => el?.closest('[data-money-format]')?.dataset.moneyFormat || '${{amount}}';
