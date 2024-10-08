import { getKlineData } from "./kline.js";
import { RSI_PERIOD_SETTING } from "../configs/config.js";
import { rsi } from "technicalindicators";

let cachedTimestamp = null;
let cachedKlineData = [];
let cachedRsiData = new Map();

const shouldGetLatestKlineData = (data) => {
  const noCachedData = data.length === 0;
  const isCachedDataExpired = Date.now() > cachedTimestamp;
  return noCachedData || isCachedDataExpired;
};

export const getCachedKlineData = async () => {
  if (shouldGetLatestKlineData(cachedKlineData)) {
    const klineData = await getKlineData();
    cachedTimestamp = Date.now() + 60 * 60 * 1000;
    cachedKlineData = klineData;
  }
  return cachedKlineData;
};

const shouldGetLatestRsiData = () => {
  const noCachedData = cachedRsiData.size === 0;
  const isCachedDataExpired = Date.now() > cachedTimestamp;
  return noCachedData || isCachedDataExpired;
};

export const getCachedRsiData = async () => {
  if (shouldGetLatestRsiData()) {
    const cachedKlineData = await getCachedKlineData();
    const values = cachedKlineData.map((kline) => kline.closePrice);
    for (
      let period = RSI_PERIOD_SETTING.min;
      period <= RSI_PERIOD_SETTING.max;
      period += 1
    ) {
      const rsiData = rsi({ period, values });
      const emptyLength = values.length - rsiData.length;
      const emptyArray = Array(emptyLength).fill(null);
      cachedRsiData.set(period, [...emptyArray, ...rsiData]);
    }
  }
  return cachedRsiData;
};
