# Portfolio Tracker - Backend System Design Challenge

**Duration:** 60 minutes  
**Mode:** Live coding with screen sharing

---

## Overview

Build a backend system for a **Portfolio Tracker** that allows users to manage their stock holdings and track investment returns.

---

## Technical Requirements

### Stack

- **Language/Framework:** Your choice (Node.js, Python, Java, etc.)
- **Database:** Optional - You may use MongoDB, PostgreSQL, MySQL, or even file-based storage
- **API Type:** RESTful APIs preferred

### Rules

- ❌ **NO AI tools allowed** (ChatGPT, Copilot, etc.)
- ✅ Official documentation is permitted
- ⚠️ **All 3 use cases must be completed** - Missing even one results in elimination
- You may choose to build a full backend server OR just implement functions

---

## Problem Statement

You need to build a system that tracks stock portfolio holdings and calculates returns.

### Data Models

#### Trade/Holding

Each trade should contain:

- `stock_ticker` (string) - Stock symbol (e.g., "TCS", "INFY", "RELIANCE")
- `shares` (number) - Number of shares bought/sold
- `price` (number) - Price per share at which trade was executed
- `trade_type` (string) - Either "buy" or "sell"

#### Stock (Optional)

If you want to track current market prices:

- `ticker` (string) - Stock symbol
- `current_price` (number) - Current market price

---

## Use Cases to Implement

### **Use Case 1: Add Trades**

**Endpoint:** `POST /holdings`

**Description:**  
Allow users to add buy/sell trades to their portfolio.

**Request Body:**

```json
{
  "stock_ticker": "TCS",
  "shares": 10,
  "price": 3500,
  "trade_type": "buy"
}
```

**Business Logic:**

1. **For BUY trades:**
   - If the stock doesn't exist in portfolio → Create new holding
   - If the stock already exists → Update the holding:
     - Add shares: `total_shares = existing_shares + new_shares`
     - Calculate new average buy price:
       ```
       new_average = (existing_avg × existing_shares + new_price × new_shares)
                     ÷ (existing_shares + new_shares)
       ```

2. **For SELL trades:**
   - Reduce the number of shares: `total_shares = existing_shares - sold_shares`
   - Average buy price remains unchanged
   - If shares become 0, you may choose to keep or remove the holding

**Response:**

```json
{
  "_id": "uuid",
  "stock_ticker": "TCS",
  "shares": 10,
  "average_buy_price": 3500,
  "trade_type": "buy"
}
```

---

### **Use Case 2: Fetch All Holdings**

**Endpoint:** `GET /holdings`

**Description:**  
Retrieve all current holdings in the portfolio.

**Response:**

```json
[
  {
    "_id": "uuid-1",
    "stock_ticker": "TCS",
    "shares": 15,
    "average_buy_price": 3400,
    "trade_type": "buy"
  },
  {
    "_id": "uuid-2",
    "stock_ticker": "INFY",
    "shares": 20,
    "average_buy_price": 1500,
    "trade_type": "buy"
  }
]
```

---

### **Use Case 3: Calculate Portfolio Returns**

**Endpoint:** `GET /holdings/returns`

**Description:**  
Calculate the cumulative returns for the entire portfolio.

**Formula:**

```
Total Returns = Σ [(Current Price - Average Buy Price) × Shares]
```

For each holding, calculate:

```
return_per_stock = (current_price - average_buy_price) × shares
```

**Note:** You need to determine current prices. You can either:

- Hardcode them for demo purposes (e.g., assume all stocks trade at ₹100)
- Create a stocks table/collection with current prices
- Accept current prices as query parameters

**Response:**

```json
{
  "returns": 25000
}
```

Or simply return the number:

```json
25000
```

---

## Evaluation Criteria

### Must-Have (Mandatory)

- ✅ All 3 use cases working correctly
- ✅ Proper average price calculation for multiple buys
- ✅ API should handle both "buy" and "sell" trade types
- ✅ No duplicate holdings for the same stock ticker

### Good-to-Have

- Clean, scalable architecture
- Proper error handling and validation
- TypeScript/type safety (if using Node.js)
- Separation of concerns (controllers, services, DAOs)
- Database integration

### Will NOT Save You

- Beautiful architecture without working use cases = ❌ **Elimination**
- Missing even 1 use case = ❌ **Elimination**

---

## Example Flow

### Step 1: Add first trade

```bash
POST /holdings
{
  "stock_ticker": "TCS",
  "shares": 10,
  "price": 3000,
  "trade_type": "buy"
}
```

**Result:** New holding created with avg price = 3000

---

### Step 2: Buy more shares of same stock

```bash
POST /holdings
{
  "stock_ticker": "TCS",
  "shares": 5,
  "price": 3600,
  "trade_type": "buy"
}
```

**Result:** Holding updated:

- Total shares: 10 + 5 = 15
- New average: (3000×10 + 3600×5) ÷ 15 = 3200

---

### Step 3: Fetch holdings

```bash
GET /holdings
```

**Result:**

```json
[
  {
    "stock_ticker": "TCS",
    "shares": 15,
    "average_buy_price": 3200,
    "trade_type": "buy"
  }
]
```

---

### Step 4: Calculate returns

```bash
GET /holdings/returns
```

Assuming current price of TCS = 3500:

```
Returns = (3500 - 3200) × 15 = 4500
```

---

## Time Management Tips

- **0-10 min:** Design schema and API endpoints on paper
- **10-40 min:** Implement core logic and database setup
- **40-55 min:** Test all 3 use cases end-to-end
- **55-60 min:** Bug fixes and final demo preparation

---

## Notes

- Ask clarifying questions if anything is unclear
- Focus on **working code first**, architecture second
- Test your APIs before the final demo
- **Don't forget return statements** in conditional blocks!

---

**Good luck! 🚀**
