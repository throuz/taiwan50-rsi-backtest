import { getCachedRsiData } from "./cached-data.js";

export const getSignal = async ({
  positionType,
  index,
  rsiPeriod,
  rsiUpperLimit,
  rsiLowerLimit
}) => {
  const cachedRsiData = await getCachedRsiData();
  const rsiData = cachedRsiData.get(rsiPeriod);
  const preRsi = rsiData[index - 1];
  // OPEN_LONG
  if (positionType === "NONE") {
    if (preRsi > rsiUpperLimit) {
      return "OPEN_LONG";
    }
  }
  // CLOSE_LONG
  if (positionType === "LONG") {
    if (preRsi < rsiLowerLimit) {
      return "CLOSE_LONG";
    }
  }
  return "NONE";
};
