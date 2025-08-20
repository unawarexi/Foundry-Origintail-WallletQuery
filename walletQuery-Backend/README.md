# Ethereum Transactions Crawler

A RESTful API for crawling and retrieving Ethereum blockchain transaction data for specific wallet addresses.

## Features

- ✅ Get all ETH transactions for a wallet from a specific block
- ✅ Get ETH balance at a specific date
- ✅ Get all ERC20 token transactions for a wallet  
- ✅ Get ERC20 token balance at a specific date
- ✅ Human-readable transaction formatting
- ✅ Multiple Ethereum provider support with fallbacks

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- An Ethereum provider API key (Infura, Alchemy, or Etherscan)

## Installation

1. **Clone/create the project directory:**
   ```bash
   check the root readme for setup 
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env`
   - Add your Ethereum provider API key(s)

4. **Create the project structure:**
   ```
   project-root/
   ├── index.js
   ├── package.json
   ├── .env
   ├── .api/@opensea 
   ├── config/
   │   └── ether.provider.js
   ├── controllers/
   │   └── eth.controller.js, nft.controller.js
   ├── routes/
   │   └── eth.routes.js, nft.routes.js
   ├── services/
   │   └── eth.service.js, nft.service.js
   └── utils/
           └── format.js
   ```

## Getting API Keys

### Infura (Recommended)
1. Visit [infura.io](https://infura.io)
2. Create a free account
3. Create a new project
4. Copy the Project ID
5. Use: `https://mainnet.infura.io/v3/YOUR_PROJECT_ID`

### Alchemy (Alternative)
1. Visit [alchemy.com](https://alchemy.com)
2. Create a free account
3. Create an app for Ethereum Mainnet
4. Copy the API key
5. Use: `https://eth-mainnet.alchemyapi.io/v2/YOUR_API_KEY`

**Note: do the same for `etherscan and opensea` check docs for further information**

## Running the Application

1. **Start Server:**
   ```bash
   npm start
   ```

The server will start on `http://localhost:3000` (or your specified PORT).

## API Endpoints

### 1. Get ETH Transactions
```
GET /api/transactions?address=0x...&fromBlock=9000000
```

**Example:**
```bash
curl "http://localhost:3000/api/transactions?address=0xaa7a9ca87d3694b5755f213b5d04094b8d0f0a6f&fromBlock=9000000"
```

### 2. Get ETH Balance at Date
```
GET /api/transactions/balance?address=0x...&date=2024-01-01
```

**Example:**
```bash
curl "http://localhost:3000/api/transactions/balance?address=0xaa7a9ca87d3694b5755f213b5d04094b8d0f0a6f&date=2024-01-01"
```

### 3. Get Token Transactions
```
GET /api/transactions/tokens?address=0x...&fromBlock=9000000
```

**Example:**
```bash
curl "http://localhost:3000/api/transactions/tokens?address=0xaa7a9ca87d3694b5755f213b5d04094b8d0f0a6f&fromBlock=9000000"
```

### 4. Get Token Balance at Date
```
GET /api/transactions/token-balance?address=0x...&token=0x...&date=2024-01-01
```

**Example:**
```bash
curl "http://localhost:3000/api/transactions/token-balance?address=0xaa7a9ca87d3694b5755f213b5d04094b8d0f0a6f&token=0xA0b86a33E6441E8ba00cCAF8b42C13a33b0C5be2&date=2024-01-01"
```

## Response Format

### ETH Transaction Response
```json
{
  "hash": "0x...",
  "from": "0x...",
  "to": "0x...",
  "value": "0.1",
  "gasPrice": "20.5",
  "gasUsed": "21000",
  "blockNumber": 9000001,
  "timestamp": 1640995200,
  "date": "2022-01-01T00:00:00.000Z",
  "type": "ETH"
}
```

### Token Transaction Response
```json
{
  "hash": "0x...",
  "from": "0x...",
  "to": "0x...",
  "value": "100.5",
  "tokenAddress": "0x...",
  "symbol": "USDC",
  "blockNumber": 9000001,
  "timestamp": 1640995200,
  "date": "2022-01-01T00:00:00.000Z",
  "type": "TOKEN"
}
```

## Testing the API

Test with a well-known address (Ethereum Foundation):
```bash
# Get recent transactions
curl "http://localhost:3000/api/transactions?address=0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe&fromBlock=18000000"

# Get balance on a specific date
curl "http://localhost:3000/api/transactions/balance?address=0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe&date=2024-01-01"
```

## Troubleshooting

### Common Issues

1. **"No default engine" error:**
   - Make sure you're using the correct app.js structure above
   - Ensure all routes return JSON with `res.json()`, not `res.render()`

2. **Provider connection errors:**
   - Check your `.env` file has valid API keys
   - Verify your internet connection
   - Try a different provider (Infura, Alchemy, Etherscan)

3. **Performance issues:**
   - Large block ranges can be slow
   - Consider implementing pagination for large datasets
   - Use smaller `fromBlock` values for testing

4. **Rate limiting:**
   - Free tier APIs have request limits
   - Consider implementing caching for repeated requests

## Notes

- The application crawls blocks sequentially which can be slow for large ranges
- Free API tiers have rate limits - consider paid plans for production use
- Token transactions use event logs which are more efficient than scanning all blocks
- All timestamps are in UTC
- Balance queries use binary search to find the closest block to the specified date
