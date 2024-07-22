# Taiwan50 RSI Backtest

This project is a backtesting system for the Taiwan stock 0050 using the Relative Strength Index (RSI) strategy. It is built using Node.js and JavaScript, allowing for efficient and scalable code. The system simulates trading activities based on historical data to evaluate the effectiveness of the RSI strategy.

## Features

- **Historical Data Retrieval**: Fetches historical price data for Taiwan stock 0050.
- **RSI Calculation**: Computes the RSI based on the historical data.
- **Trading Simulation**: Performs simulated trades based on RSI values and predefined buy/sell thresholds.
- **Parameter Optimization**: Backtests a range of parameters to find the optimal settings for the RSI strategy by testing all possible parameter combinations.
- **Result Display**: Outputs the best parameter settings and their performance in the terminal.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## Installation

To get started with the project, clone the repository and install the dependencies:

```bash
git clone https://github.com/throuz/taiwan50-rsi-backtest.git
cd taiwan50-rsi-backtest
npm install
```

## Usage

To run the backtests and display the best result in the terminal, use:

```bash
npm run app
```

## Configuration

Configuration settings are located in the configs/config.js file. The configuration includes:

```javascript
export const TELEGRAM_BOT_TOKEN = "";
export const TELEGRAM_CHAT_ID = "";

export const INITIAL_FUNDING = 1000000;
export const FEE_RATE = 0.0004275; // 0.1425% & 手續費3折 = 0.04275%
export const RSI_PERIOD_SETTING = { min: 1, max: 50 };
export const RSI_BUY_LEVEL_SETTING = { min: 1, max: 100 };
export const RSI_SELL_LEVEL_SETTING = { min: 1, max: 100 };
```

Ensure you set up your Telegram bot token and chat ID, along with any other parameters you wish to adjust.

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Create a new Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](https://opensource.org/licenses/MIT) file for details.
