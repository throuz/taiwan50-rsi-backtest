import { Presets, SingleBar } from "cli-progress";
import {
  RSI_PERIOD_SETTING,
  RSI_SELL_LEVEL_SETTING,
  FEE_RATE,
  INITIAL_FUNDING,
  RSI_BUY_LEVEL_SETTING
} from "../configs/config.js";
import { getCachedKlineData } from "./cached-data.js";
import { getSignal } from "./signal.js";

const getReadableTime = (timestamp) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const getLogColor = (pnl) => {
  const logRedColor = "\x1b[31m";
  const logGreenColor = "\x1b[32m";
  return pnl > 0 ? logGreenColor : logRedColor;
};

const toPercentage = (number) => {
  return `${Math.round(number * 100)}%`;
};

const calculateDays = (openTimestamp, closeTimestamp) => {
  const differenceInMilliseconds = closeTimestamp - openTimestamp;
  const days = differenceInMilliseconds / (1000 * 60 * 60 * 24);
  return days;
};

const logTradeResult = ({
  lots,
  finalFund,
  openPrice,
  closePrice,
  openTimestamp,
  closeTimestamp
}) => {
  const investFund = openPrice * lots;
  const pnl = (closePrice - openPrice) * lots;
  const logResetColor = "\x1b[0m";
  const logColor = getLogColor(pnl);
  const formatedFund = finalFund.toFixed(2);
  const pnlPercentage = toPercentage(pnl / investFund);
  const holdTimeDays = calculateDays(openTimestamp, closeTimestamp);
  const startTime = getReadableTime(openTimestamp);
  const endTime = getReadableTime(closeTimestamp);
  console.log(
    `${logColor}Fund: ${formatedFund} (${lots} lots) [${openPrice} ~ ${closePrice}] (${pnlPercentage}) [${startTime} ~ ${endTime}] (${holdTimeDays} days)${logResetColor}`
  );
};

export const getBacktestResult = async ({
  shouldLogResults,
  rsiPeriod,
  rsiBuyLevel,
  rsiSellLevel
}) => {
  let fund = INITIAL_FUNDING;
  let positionType = "NONE";
  let lots = null;
  let openTimestamp = null;
  let openPrice = null;
  const cachedKlineData = await getCachedKlineData();
  for (let i = RSI_PERIOD_SETTING.max + 1; i < cachedKlineData.length; i++) {
    const curKline = cachedKlineData[i];
    const signal = await getSignal({
      positionType,
      index: i,
      rsiPeriod,
      rsiBuyLevel,
      rsiSellLevel
    });
    const openLong = () => {
      openPrice = curKline.openPrice;
      lots = Math.trunc(fund / openPrice);
      const investFund = openPrice * lots;
      const fee = investFund * FEE_RATE;
      fund = fund - investFund - fee;
      positionType = "LONG";
      openTimestamp = curKline.openTime;
    };
    const closeLong = () => {
      const closePrice = curKline.openPrice;
      const returnFund = closePrice * lots;
      const fee = returnFund * (FEE_RATE + 0.003); // Securities tax 0.3%
      const finalFund = fund + returnFund - fee;
      const closeTimestamp = curKline.openTime;
      if (shouldLogResults) {
        logTradeResult({
          lots,
          finalFund,
          openPrice,
          closePrice,
          openTimestamp,
          closeTimestamp
        });
      }
      fund = finalFund;
      positionType = "NONE";
      lots = null;
      openTimestamp = null;
      openPrice = null;
    };
    if (signal === "OPEN_LONG") {
      openLong();
    }
    if (signal === "CLOSE_LONG") {
      closeLong();
    }
    if (positionType === "LONG" && i === cachedKlineData.length - 1) {
      closeLong();
    }
  }
  return {
    fund,
    rsiPeriod,
    rsiBuyLevel,
    rsiSellLevel
  };
};

const getSettings = () => {
  const settings = [];
  for (
    let rsiPeriod = RSI_PERIOD_SETTING.min;
    rsiPeriod <= RSI_PERIOD_SETTING.max;
    rsiPeriod += 1
  ) {
    for (
      let rsiBuyLevel = RSI_BUY_LEVEL_SETTING.min;
      rsiBuyLevel <= RSI_BUY_LEVEL_SETTING.max;
      rsiBuyLevel += 1
    ) {
      for (
        let rsiSellLevel = RSI_SELL_LEVEL_SETTING.min;
        rsiSellLevel <= RSI_SELL_LEVEL_SETTING.max;
        rsiSellLevel += 1
      ) {
        settings.push({
          rsiPeriod,
          rsiBuyLevel,
          rsiSellLevel
        });
      }
    }
  }
  return settings;
};

export const getBestBacktestResult = async () => {
  const settings = getSettings();

  const progressBar = new SingleBar({}, Presets.shades_classic);
  progressBar.start(settings.length, 0);

  let bestBacktestResult = { fund: 0 };

  for (const setting of settings) {
    const { rsiPeriod, rsiBuyLevel, rsiSellLevel } = setting;
    const backtestResult = await getBacktestResult({
      shouldLogResults: false,
      rsiPeriod,
      rsiBuyLevel,
      rsiSellLevel
    });
    if (backtestResult && backtestResult.fund > bestBacktestResult.fund) {
      bestBacktestResult = backtestResult;
    }
    progressBar.increment();
  }

  progressBar.stop();

  return bestBacktestResult;
};
