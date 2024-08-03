export const getSignal = async ({
  positionType,
  isProfit,
  preRsi,
  rsiBuyLevel,
  rsiSellLevel
}) => {
  // OPEN_LONG
  if (positionType === "NONE") {
    if (preRsi > rsiBuyLevel) {
      return "OPEN_LONG";
    }
  }
  // CLOSE_LONG
  if (positionType === "LONG" && isProfit) {
    if (preRsi < rsiSellLevel) {
      return "CLOSE_LONG";
    }
  }
  return "NONE";
};
