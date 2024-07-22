async function fetchHistoricalData(stockSymbol) {
  const response = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${stockSymbol}?interval=1d&range=20y`
  );
  const data = await response.json();
  return data.chart.result[0];
}

function formatNumberToTwoDecimalPlaces(number) {
  return number !== null ? (Math.round(number * 100) / 100).toString() : null;
}

function convertToDesiredFormat(data) {
  const timestamps = data.timestamp;
  const quotes = data.indicators.quote[0];

  return timestamps.map((timestamp, index) => {
    const openTime = timestamp * 1000;
    const closeTime = openTime + 24 * 60 * 60 * 1000 - 1;
    return [
      openTime,
      formatNumberToTwoDecimalPlaces(quotes.open[index]),
      formatNumberToTwoDecimalPlaces(quotes.high[index]),
      formatNumberToTwoDecimalPlaces(quotes.low[index]),
      formatNumberToTwoDecimalPlaces(quotes.close[index]),
      quotes.volume[index]?.toString() || null,
      closeTime,
      null, // Quote asset volume (not provided by Yahoo Finance)
      null, // Number of trades (not provided by Yahoo Finance)
      null, // Taker buy base asset volume (not provided by Yahoo Finance)
      null, // Taker buy quote asset volume (not provided by Yahoo Finance)
      null // Ignore
    ];
  });
}

async function getConvertedHistoricalData(stockSymbol) {
  const historicalData = await fetchHistoricalData(stockSymbol);
  return convertToDesiredFormat(historicalData);
}

export const getKlineData = async () => {
  const convertedHistoricalData = await getConvertedHistoricalData("0050.TW");
  const klineData = convertedHistoricalData.map((data) => ({
    openPrice: Number(data[1]),
    highPrice: Number(data[2]),
    lowPrice: Number(data[3]),
    closePrice: Number(data[4]),
    volume: Number(data[5]),
    openTime: data[0],
    closeTime: data[6]
  }));
  return klineData;
};
