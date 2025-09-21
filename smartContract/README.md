# AfterLife-Protocol Smart Contract 🔗

> Solidity Smart Contract for Decentralized Digital Inheritance

This directory contains the smart contract that powers the AfterLife-Protocol, built with Solidity and Foundry. The contract handles digital will creation, nominee management, inheritance distribution, and security features.

## 🛠️ Tech Stack

- **Language**: Solidity ^0.8.24
- **Framework**: Foundry
- **Testing**: Forge
- **Deployment**: Forge Scripts
- **Security**: OpenZeppelin Contracts

## 🚀 Getting Started

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Git

### Installation

1. **Install Foundry** (if not already installed)

   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. **Navigate to smart contract directory**

   ```bash
   cd smartContract
   ```

3. **Install dependencies**

   ```bash
   forge install
   ```

4. **Set up environment variables**
   Create a `.env` file:
   ```env
   PRIVATE_KEY=your_private_key_here
   RPC_URL=your_rpc_url_here
   ```

## 📋 Contract Overview

### AfterLifeProtocol.sol

The main contract that implements the digital inheritance functionality.

#### Key Features

- **Will Management**: Create, modify, and manage digital wills
- **Nominee System**: Add up to 30 nominees with share allocations
- **Inactivity Tracking**: Configurable inactivity periods (3 days - 20 years)
- **Inheritance Claims**: Secure claim mechanism for beneficiaries
- **Security**: Reentrancy protection and access controls

## 🧪 Testing

### Running Tests

```bash
# Run all tests
forge test

# Run tests with verbosity
forge test -vvv

# Run specific test file
forge test --match-path test/AfterLifeProtocol.t.sol

```

## 🚀 Deployment

### Local Deployment

```bash
# Start local anvil node
anvil

# Deploy to local network
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --private-key $PRIVATE_KEY --broadcast
```

### Testnet Deployment

```bash
# Deploy to Sepolia
forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY --broadcast
```

## 📚 Resources

- [Solidity Documentation](https://docs.soliditylang.org/)
- [Foundry Book](https://book.getfoundry.sh/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Ethereum Development Guidelines](https://ethereum.org/en/developers/)

---

**Secure, Tested, Optimized 🔒**
