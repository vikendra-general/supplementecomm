// Currency conversion utility
// 1 USD = ~83 INR (approximate rate, you can update this as needed)
export const USD_TO_INR_RATE = 83;

export const convertToINR = (usdPrice: number | null | undefined): number => {
  if (usdPrice === null || usdPrice === undefined) {
    return 0;
  }
  return usdPrice * USD_TO_INR_RATE;
};

export const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatINRWithDecimals = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Helper function to convert and format USD prices to INR
export const formatPrice = (usdPrice: number, withDecimals: boolean = false): string => {
  const inrPrice = convertToINR(usdPrice);
  return withDecimals ? formatINRWithDecimals(inrPrice) : formatINR(inrPrice);
};