export function formatPrice(price: string | number | undefined | null): string {
  if (price === undefined || price === null) {
    return '–';
  }

  const numPrice = typeof price === 'string' ? parseFloat(price) : price;

  if (isNaN(numPrice)) {
    return '–';
  }
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'SEK',
    minimumFractionDigits: numPrice % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  };

  if (numPrice % 1 === 0) {
    options.minimumFractionDigits = 0;
  } else {
    options.minimumFractionDigits = 2;
  }

  return new Intl.NumberFormat('sv-SE', options).format(numPrice);
}
