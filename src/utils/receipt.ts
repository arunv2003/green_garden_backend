export const generateReceiptNumber = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `GG-${year}-${random}`;
};
