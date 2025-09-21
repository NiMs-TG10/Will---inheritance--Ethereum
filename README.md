# AfterLife-Protocol 🏛️

> Decentralized Digital Inheritance Protocol for Ethereum

AfterLife-Protocol is a revolutionary blockchain-based solution that enables secure, transparent, and automated digital inheritance of cryptocurrency assets. Built on Ethereum, it allows users to create digital wills, designate beneficiaries, and ensure their crypto assets are distributed according to their wishes after periods of inactivity.

## Live Demo

[Access the AfterLife-Protocol platform](https://afterlife-protocol.vercel.app/) (Deployed on Vercel — works with the Sepolia testnet)

## 🌟 Key Features

- **Digital Will Creation**: Deposit ETH and create comprehensive digital wills
- **Multi-Beneficiary Support**: Select up to 30 nominees with customizable share allocations
- **Flexible Inactivity Periods**: Set inactivity duration from 3 days to 20 years (default: 180 days)
- **Active Status Management**: Simple "I Am Alive" functionality to maintain active status
- **Inheritance Management**: View and manage inheritances you're entitled to receive
- **Real-time Dashboard**: Monitor deposits, nominees, activity status, and inheritance claims
- **Security First**: Protected against reentrancy attacks and other smart contract vulnerabilities
- **Partial Withdrawals**: Withdraw any amount from 0 to your total eligible share

## 🏗️ Architecture

```
AfterLife-Protocol/
├── frontend/          # React.js Web Application
└── smartContract/         # Solidity Smart Contract (Foundry)

```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Foundry
- MetaMask or compatible Web3 wallet

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/jai123singh/AfterLife-Protocol.git
   cd AfterLife-Protocol
   ```

2. **Install dependencies**

   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install smart contract dependencies
   cd smartContract
   forge install
   ```

3. **Set up environment variables**

   ```bash
   # frontend (.env)
   VITE_CONTRACT_ADDRESS=your_contract_address
   VITE_HTTP_RPC_URL=your_network_url

   # smartContract (.env)
   PRIVATE_KEY=your_private_key
   RPC_URL=your_rpc_url
   ```

4. **Deploy smart contract**

   ```bash
   cd smartContract
   forge script script/Deploy.s.sol --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast
   ```

5. **Start the frontend**
   ```bash
   cd frontend
   npm run dev
   ```

## 📖 How It Works

### For Will Creators

1. **Connect Wallet**: Connect your Ethereum wallet to the platform
2. **Deposit ETH**: Add funds to your digital will
3. **Add Nominees**: Select up to 30 beneficiaries with their details and share percentages
4. **Set Inactivity Period**: Choose your preferred inactivity duration (3 days - 20 years)
5. **Stay Active**: Interact with the contract or use "I Am Alive" to maintain active status

### For Beneficiaries

1. **View Inheritances**: Check the "My Inheritance" section for all wills you're included in
2. **Monitor Status**: Track inactivity periods and claim eligibility
3. **Claim Inheritance**: Withdraw your designated share when inheritance becomes available
4. **Flexible Claims**: Claim partial amounts and leave the rest for later

## 🛡️ Security Features

- **Reentrancy Protection**: Smart contracts protected against reentrancy attacks
- **Input Validation**: Comprehensive validation on both frontend and smart contract levels
- **Access Control**: Strict permissions for will modifications and claims
- **Audit Trail**: All transactions recorded on-chain for transparency

## 🔧 Technical Stack

### Frontend

- **Framework**: React.js with Vite
- **Styling**: Tailwind CSS
- **Web3 Integration**: Wagmi
- **Language**: JavaScript

### Smart Contract

- **Language**: Solidity
- **Framework**: Foundry
- **Network**: Sepolia (Ethereum testnet)

## 📱 Dashboard Features

### "My Will" Dashboard

- Total deposit amount
- List of all nominees and their details
- Inactivity period and last check-in status
- Share allocation overview

### "My Inheritance" Dashboard

- List of all inheritances you're entitled to
- Sortable by amount, inactivity period, and other parameters
- Claim status and availability
- Detailed benefactor information

## 🎯 Use Cases

- **Long-term Crypto Holders**: Ensure assets don't become permanently lost
- **Family Planning**: Secure financial future for family members
- **Business Continuity**: Transfer business-related crypto assets
- **Charity Donations**: Automated charitable giving after passing

## 📄 License

[MIT](LICENSE)

## 📞 Contact

For questions or feedback, please open an issue on this repository or reach out at [Jaisinghtomar9211@gmail.com](mailto:Jaisinghtomar9211@gmail.com).

## 🗺️ Roadmap

- [ ] Multi-token support (ERC-20 tokens)
- [ ] Mobile application
- [ ] Integration with legal frameworks
- [ ] Multi-signature support
- [ ] Cross-chain compatibility

---

**Built with ❤️ for the future of digital inheritance**
