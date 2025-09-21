# AfterLife-Protocol Frontend 🎨

> React.js Web Application for Digital Inheritance Management

The frontend application provides an intuitive user interface for interacting with the AfterLife-Protocol smart contracts. Built with modern React.js and styled with Tailwind CSS, it offers a seamless Web3 experience for managing digital wills and inheritances.

## 🛠️ Tech Stack

- **Framework**: React.js with Vite
- **Language**: JavaScript
- **Styling**: Tailwind CSS
- **Web3 Integration**: Wagmi
- **Build Tool**: Vite
- **Package Manager**: npm

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask or compatible Web3 wallet

### Installation

1. **Navigate to frontend directory**

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the frontend directory:

   ```env
   VITE_CONTRACT_ADDRESS=your_contract_address
   VITE_HTTP_RPC_URL=your_network_url
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 📱 Features & Pages

### 🏠 Dashboard

- **Overview**: Total deposits, active status, last check-in, settings
- **Will Summary**: total allocation, share allocation breakdown
- **Quick Action**: "I Am Alive" button

### 📝 Will Creation & Management

- **Deposit ETH**: Add funds to your digital will
- **Nominee Management**: Add/edit up to 30 nominees
- **Share Allocation**: Set percentage distribution with validation
- **Inactivity Settings**: Configure inactivity period (3 days - 20 years)
- **Will Editing**: Modify will details while active

### 🎁 Inheritance Management

- **Inheritance List**: View all wills you're nominated in
- **Sorting & Filtering**: Sort by amount, inactivity period, status
- **Claim Interface**: Withdraw available inheritances
- **Status Tracking**: Monitor claim eligibility and amounts

### 🔔 Notifications System

- **Real-time Updates**: Contract interaction notifications
- **Status Alerts**: Inactivity warnings and claim notifications
- **Transaction Tracking**: Success/failure notifications

## 📱 Responsive Design

The application is fully responsive and works on:

- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🚀 Build & Deployment

### Development Build

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📚 Resources

- [React Documentation](https://reactjs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Wagmi Documentation](https://wagmi.sh/)

---

**Happy coding! 🚀**
