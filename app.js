import schedule from "node-schedule";
import TelegramBot from "node-telegram-bot-api";
import { getBacktestResult, getBestBacktestResult } from "./src/backtest.js";
import { getCachedRsiData } from "./src/cached-data.js";
import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from "./configs/config.js";

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);

const sendTelegramMessage = async (message) => {
  bot.sendMessage(TELEGRAM_CHAT_ID, message);
};

const getSignal = ({ rsiBuyLevel, rsiSellLevel, curRsi }) => {
  if (curRsi > rsiBuyLevel) {
    return "BUY";
  }
  if (curRsi < rsiSellLevel) {
    return "SELL";
  }
  return "NONE";
};

const execute = async () => {
  try {
    const dateTime = new Date().toLocaleString();
    console.log(dateTime);

    const bestBacktestResult = await getBestBacktestResult();
    const { rsiPeriod, rsiBuyLevel, rsiSellLevel } = bestBacktestResult;
    await getBacktestResult({
      shouldLogResults: true,
      rsiPeriod,
      rsiBuyLevel,
      rsiSellLevel
    });
    console.log(bestBacktestResult);

    const cachedRsiData = await getCachedRsiData();
    const rsiData = cachedRsiData.get(rsiPeriod);
    const curRsi = rsiData[rsiData.length - 1];
    console.log("Current RSI", curRsi);

    const signal = getSignal({ rsiBuyLevel, rsiSellLevel, curRsi });
    console.log("Signal:", signal);

    const message = `Execution at ${dateTime}:
    RSI Period: ${rsiPeriod}
    RSI Buy Level: ${rsiBuyLevel}
    RSI Sell Level: ${rsiSellLevel}
    Current RSI: ${curRsi}
    Signal: ${signal}`;
    await sendTelegramMessage(message);

    console.log(
      "=============================================================="
    );
  } catch (error) {
    console.error(error);
    await sendTelegramMessage(`Error occurred: ${error.message}`);
  }
};

await execute();

schedule.scheduleJob("0 15 * * *", execute);
