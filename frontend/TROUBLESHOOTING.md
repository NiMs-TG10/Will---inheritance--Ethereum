# Frontend Troubleshooting Guide

## Issue: White Screen

If you're seeing a white screen, try these steps:

### 1. Check Browser Console
Open your browser's Developer Tools (F12 or Cmd+Option+I) and check the Console tab for errors.

### 2. Verify Services Are Running

```bash
# Check Anvil is running on port 8545
lsof -i :8545

# Check Frontend is running on port 5173
lsof -i :5173
```

### 3. Clear Browser Cache
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)
- Or clear browser cache completely

### 4. Restart Services

```bash
# Stop all processes
pkill -f "anvil"
pkill -f "vite"

# Start Anvil
cd /Users/nishantmehta/Developer/Projects/Solidity/Will-inheritance
anvil &

# Wait a few seconds, then start frontend
cd frontend
npm run dev
```

### 5. Check Environment Variables

```bash
cd /Users/nishantmehta/Developer/Projects/Solidity/Will-inheritance/frontend
cat .env
```

Should show:
```
VITE_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VITE_HTTP_RPC_URL=http://localhost:8545
```

### 6. Common Issues

**If you see "Module not found" errors:**
```bash
cd frontend
npm install
```

**If the page loads but shows errors about network:**
- Make sure Anvil is running
- Verify the contract is deployed

**If MetaMask shows "Wrong Network":**
- Add Local Anvil network to MetaMask (see SETUP-LOCAL.md)

