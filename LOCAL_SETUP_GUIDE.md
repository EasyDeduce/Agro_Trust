# Local Setup Guide — AgroTrust

This guide sets up the AgroTrust project (frontend + backend + smart contracts) for local development.

## Prerequisites

- Node.js 18+
- npm 8+
- Git
- MongoDB (v5.0 or higher)
- MetaMask browser extension

## Step 1: Clone the Repository

```bash
git clone <your-repo-url>.git AgroTrust
cd AgroTrust
```

## Step 2: Install Dependencies

### Install Root Dependencies

```bash
npm install
```

### Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

## Step 3: Configure Environment Variables

Create `.env` files in the root, backend, and frontend directories:

### Root .env (Hardhat / optional)

```
INFURA_API_KEY=your_infura_api_key
PRIVATE_KEY=your_private_key_for_deployment
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Backend .env

```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/agritrust
JWT_SECRET=<generate-a-long-random-string>
```

### Frontend .env

```
REACT_APP_BACKEND_URL=http://localhost:3001/api
REACT_APP_AGRI_CHAIN_ADDRESS=0x...
REACT_APP_BATCH_TOKEN_ADDRESS=0x...
REACT_APP_AUTHENTICATION_ADDRESS=0x...
```

## Step 4: Start Local Blockchain

Open a terminal and start the local Hardhat blockchain:

```bash
npx hardhat node
```

This starts a local Ethereum blockchain and generates funded test accounts. Keep this terminal open.

## Step 5: Deploy Smart Contracts

In a new terminal:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

This deploys the contracts locally. Note the addresses printed in the console:

```
BatchToken deployed to: 0x...
AgriChain deployed to: 0x...
BatchToken configured with AgriChain address
Authentication deployed to: 0x...
```

Update the frontend `.env` with these addresses (include the `0x` prefix, no quotes or spaces). The app also reads saved addresses from `localStorage` if `.env` is empty during dev.

## Step 6: Set Up MongoDB

Ensure MongoDB is running. You can start it with:

```bash
mongod
```

The backend auto‑creates the database and collections on start.

## Step 7: Start Backend Server

In a new terminal:

```bash
cd backend
npm run start
```

The server starts on http://localhost:3001.

## Step 8: Start Frontend Application

In another terminal:

```bash
cd frontend
npm start
```

The React app opens at http://localhost:3000.

## Step 9: Connect MetaMask

1. Open MetaMask
2. Add a new network:
   - Network Name: Hardhat Local
   - RPC URL: http://localhost:8545
   - Chain ID: 31337
   - Currency Symbol: ETH
3. Import a Hardhat test account using its private key (printed when `hardhat node` starts)

## Step 10: Register and Use the Application

1. Navigate to http://localhost:3000
2. Connect MetaMask
3. Register as Farmer, Certifier, or Retailer
4. Use the app by role:
   - Farmers: create new batches (manual `batchId` string), request certification, bulk import via CSV
   - Certifiers: approve/reject with health/expiry/lab fields
   - Retailers: view certified batches and purchase
   - Anyone: lookup batches and view full history; scan QR to verify

## Common Issues and Troubleshooting

### MetaMask Connection Issues

If you encounter problems connecting MetaMask:
- Make sure the Hardhat node is running
- Confirm you have the correct RPC URL and Chain ID
- Try resetting your account in MetaMask (Settings > Advanced > Reset Account)

### Transaction Errors

If transactions fail:
- Check dev console/network tab for messages
- Ensure the current MetaMask account matches the role
- Gas is estimated automatically; confirm chain is `31337`

### Contract Deployment Issues

If contract deployment fails:
- Ensure `hardhat node` is running
- Use an unlocked Hardhat account for deployment
- Verify `.env` and RPC URL

## Development Tips

### Running Tests

To run smart contract tests:

```bash
npx hardhat test
```

### Compiling Contracts

To compile contracts without deploying:

```bash
npx hardhat compile
```

### Full Reset

If you need to completely reset:

1. Stop all running processes
2. Delete `artifacts/` and `cache/`
3. Restart `npx hardhat node`
4. Redeploy contracts
5. Update `frontend/.env` or clear saved addresses in browser `localStorage`

## Create a new Git repo and push (Ubuntu CLI)

1) Initialize locally in this folder
```
git init
git add .
git commit -m "Initial commit: AgroTrust"
```
2) Create a matching empty repo on GitHub (via UI), copy its HTTPS URL, then:
```
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```
If you prefer SSH, replace the remote URL accordingly.
