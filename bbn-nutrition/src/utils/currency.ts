// Indian Rupee currency formatting utility
// All prices are now stored directly in INR in the database

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

// Helper function to format INR prices (no conversion needed)
export const formatPrice = (inrPrice: number, withDecimals: boolean = false): string => {
  if (inrPrice === null || inrPrice === undefined) {
    return '₹0';
  }
  return withDecimals ? formatINRWithDecimals(inrPrice) : formatINR(inrPrice);
};

// Legacy function name for backward compatibility
export const convertToINR = (price: number | null | undefined): number => {
  return price || 0;
};