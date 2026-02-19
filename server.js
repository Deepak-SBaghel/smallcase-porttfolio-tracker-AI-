// ============================================
// Portfolio Tracker - Backend Server
// ============================================
// A simple Express server that lets you:
//   1. Add buy/sell trades to your portfolio
//   2. View all your current holdings
//   3. Calculate total portfolio returns
// ============================================

const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 3000;

// This lets us read JSON from request bodies
app.use(express.json());

// ============================================
// IN-MEMORY DATA STORAGE
// ============================================
// We're using a simple array to store holdings.
// Each holding looks like:
// {
//   _id: "some-unique-id",
//   stock_ticker: "TCS",
//   shares: 15,
//   average_buy_price: 3200,
//   trade_type: "buy"
// }
// ============================================

let holdings = [];

// ============================================
// HARDCODED CURRENT PRICES (for demo purposes)
// ============================================
// In a real app, you'd fetch these from a stock API.
// For now, we just hardcode a few popular stocks.
// ============================================

const currentPrices = {
  TCS: 3500,
  INFY: 1800,
  RELIANCE: 2500,
  WIPRO: 450,
  HDFC: 1600,
};

// ============================================
// USE CASE 1: ADD TRADES (Buy or Sell)
// ============================================
// POST /holdings
//
// When someone buys a stock:
//   - If they already own it, we update the shares and recalculate avg price
//   - If they don't own it, we create a new holding
//
// When someone sells a stock:
//   - We just reduce the number of shares
//   - The average buy price stays the same (that's how it works in real life too)
// ============================================

app.post("/holdings", (req, res) => {
  const { stock_ticker, shares, price, trade_type } = req.body;

  // --- Basic validation ---
  // Make sure the user sent all required fields
  if (!stock_ticker || !shares || !price || !trade_type) {
    return res.status(400).json({
      error: "Please provide stock_ticker, shares, price, and trade_type",
    });
  }

  // Make sure trade_type is either "buy" or "sell"
  if (trade_type !== "buy" && trade_type !== "sell") {
    return res.status(400).json({
      error: 'trade_type must be either "buy" or "sell"',
    });
  }

  // Make sure shares and price are positive numbers
  if (shares <= 0 || price <= 0) {
    return res.status(400).json({
      error: "shares and price must be positive numbers",
    });
  }

  // --- Check if we already have this stock in our portfolio ---
  let existingHolding = null;
  for (let i = 0; i < holdings.length; i++) {
    if (holdings[i].stock_ticker === stock_ticker) {
      existingHolding = holdings[i];
      break;
    }
  }

  // --- Handle BUY trade ---
  if (trade_type === "buy") {
    if (existingHolding) {
      // We already own this stock, so update it
      // Calculate the new average buy price using the weighted average formula:
      // new_avg = (old_avg * old_shares + new_price * new_shares) / (old_shares + new_shares)

      let oldShares = existingHolding.shares;
      let oldAvg = existingHolding.average_buy_price;

      let totalCost = oldAvg * oldShares + price * shares;
      let totalShares = oldShares + shares;
      let newAverage = totalCost / totalShares;

      existingHolding.shares = totalShares;
      existingHolding.average_buy_price = newAverage;

      return res.status(200).json(existingHolding);
    } else {
      // We don't own this stock yet, so create a new holding
      let newHolding = {
        _id: uuidv4(),
        stock_ticker: stock_ticker,
        shares: shares,
        average_buy_price: price, // first buy, so avg price = the buy price
        trade_type: "buy",
      };

      holdings.push(newHolding);

      return res.status(201).json(newHolding);
    }
  }

  // --- Handle SELL trade ---
  if (trade_type === "sell") {
    // Can't sell something you don't own
    if (!existingHolding) {
      return res.status(400).json({
        error: `You don't own any shares of ${stock_ticker}. Can't sell what you don't have!`,
      });
    }

    // Can't sell more shares than you have
    if (shares > existingHolding.shares) {
      return res.status(400).json({
        error: `You only have ${existingHolding.shares} shares of ${stock_ticker}. Can't sell ${shares}.`,
      });
    }

    // Reduce the shares. Average buy price stays the same.
    existingHolding.shares = existingHolding.shares - shares;

    // If all shares are sold, remove the holding from the array
    if (existingHolding.shares === 0) {
      holdings = holdings.filter((h) => h.stock_ticker !== stock_ticker);
      return res.status(200).json({
        message: `All shares of ${stock_ticker} sold. Holding removed.`,
      });
    }

    return res.status(200).json(existingHolding);
  }
});

// ============================================
// USE CASE 2: FETCH ALL HOLDINGS
// ============================================
// GET /holdings
//
// Just return everything we have in our holdings array.
// Simple as that.
// ============================================

app.get("/holdings", (req, res) => {
  return res.status(200).json(holdings);
});

// ============================================
// USE CASE 3: CALCULATE PORTFOLIO RETURNS
// ============================================
// GET /holdings/returns
//
// For each stock we own, we calculate:
//   profit/loss = (current_price - average_buy_price) * shares
//
// Then we add up all the individual profits/losses
// to get the total portfolio return.
// ============================================

app.get("/holdings/returns", (req, res) => {
  let totalReturns = 0;

  for (let i = 0; i < holdings.length; i++) {
    let holding = holdings[i];

    // Look up the current price from our hardcoded prices
    // If we don't have a price for this stock, default to 100
    let currentPrice = currentPrices[holding.stock_ticker] || 100;

    // Calculate return for this stock
    let returnForThisStock =
      (currentPrice - holding.average_buy_price) * holding.shares;

    totalReturns = totalReturns + returnForThisStock;
  }

  return res.status(200).json({ returns: totalReturns });
});

// ============================================
// START THE SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`Portfolio Tracker server is running on http://localhost:${PORT}`);
  console.log("");
  console.log("Available endpoints:");
  console.log("  POST /holdings         - Add a buy/sell trade");
  console.log("  GET  /holdings         - View all holdings");
  console.log("  GET  /holdings/returns - Calculate portfolio returns");
  console.log("");
});
