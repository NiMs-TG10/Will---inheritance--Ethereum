import { WagmiProvider, createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RPC_URL, CONTRACT_ADDRESS, CONTRACT_ABI } from "./config";
import { Toaster } from "react-hot-toast";
import { useState, useEffect } from "react";
import { useDisconnect, useReadContracts, useAccount } from "wagmi";
import WelcomePage from "./pages/WelcomePage";
import Dashboard from "./pages/Dashboard";
import NewUserSetup from "./pages/NewUserSetup";
import LoadingScreen from "./components/LoadingScreen";
import { injected, metaMask, coinbaseWallet } from "wagmi/connectors";
import toast from "react-hot-toast";

const config = createConfig({
  chains: [sepolia],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http(RPC_URL),
  },
});

const queryClient = new QueryClient();

function AppContent() {
  const [isConnected, setIsConnected] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [userAddress, setUserAddress] = useState(null);
  const [userData, setUserData] = useState(null);
  const { disconnect } = useDisconnect();
  const { address } = useAccount();

  const { data, isError, refetch } = useReadContracts({
    contracts: address
      ? [
          {
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: "isNewUser",
            args: [address],
          },
          {
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: "getName",
            args: [address],
          },
          {
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: "isActive",
            args: [address],
          },
          {
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: "getTotalDepositAmount",
            args: [address],
          },
          {
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: "getNomineesDetails",
            args: [address],
          },
          {
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: "getLastCheckInTime",
            args: [address],
          },
          {
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: "getInactivityThresholdPeriod",
            args: [address],
          },
          {
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: "getIncomingInheritanceDetails",
            args: [address],
          },
        ]
      : [],
  });

  const processUserData = async () => {
    setIsFetchingData(true);
    try {
      const freshData = await refetch();
      if (!freshData.data || freshData.data.length === 0) {
        throw new Error("Failed to fetch user data");
      }

      // Check if isNewUser call failed
      if (freshData.data[0].status === "failure") {
        throw new Error("Failed to check user status");
      }

      const isNewUserResult = freshData.data[0].result;
      setIsNewUser(isNewUserResult);

      if (!isNewUserResult) {
        // For existing users, check if getName call succeeded
        if (freshData.data[1].status === "failure") {
          throw new Error("Failed to fetch user name");
        }

        // Other getter functions may return empty arrays, which is fine
        setUserData({
          name: freshData.data[1].result,
          isActive: freshData.data[2].result ?? false,
          balance: freshData.data[3].result ?? BigInt(0),
          nominees: freshData.data[4].result ?? [],
          lastCheckIn: freshData.data[5].result ?? BigInt(0),
          inactivityPeriod: freshData.data[6].result ?? BigInt(0),
          inheritances: freshData.data[7].result ?? [],
        });
      }
      return true;
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error(error.message || "Failed to fetch user data", {
        position: "top-center",
      });
      handleDisconnect();
      return false;
    } finally {
      setIsFetchingData(false);
    }
  };

  const refreshData = async () => {
    try {
      const freshData = await refetch();
      if (!freshData.data || freshData.data.length === 0) {
        throw new Error("Failed to fetch updated user data");
      }

      // Check if isNewUser call failed
      if (freshData.data[0].status === "failure") {
        throw new Error("Failed to check user status");
      }

      const isNewUserResult = freshData.data[0].result;
      setIsNewUser(isNewUserResult);

      if (!isNewUserResult) {
        // For existing users, check if getName call succeeded
        if (freshData.data[1].status === "failure") {
          throw new Error("Failed to fetch user name");
        }

        // Other getter functions may return empty arrays, which is fine
        setUserData({
          name: freshData.data[1].result,
          isActive: freshData.data[2].result ?? userData.isActive,
          balance: freshData.data[3].result ?? userData.balance,
          nominees: freshData.data[4].result ?? userData.nominees,
          lastCheckIn: freshData.data[5].result ?? userData.lastCheckIn,
          inactivityPeriod:
            freshData.data[6].result ?? userData.inactivityPeriod,
          inheritances: freshData.data[7].result ?? userData.inheritances,
        });
      }
      return true;
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error(error.message || "Failed to fetch updated user data", {
        position: "top-center",
      });
      return false;
    }
  };

  const handleConnect = async (addr) => {
    if (!addr) return;
    setUserAddress(addr);
    const success = await processUserData();
    if (success) {
      setIsConnected(true);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setIsConnected(false);
    setIsNewUser(false);
    setUserAddress(null);
    setUserData(null);
  };

  // Auto-connect if address is available and data is loaded
  useEffect(() => {
    if (address && !isConnected && data) {
      handleConnect(address);
    }
  }, [address, data]);

  // Handle contract read errors
  useEffect(() => {
    if (isError) {
      toast.error("Failed to read contract data", { position: "top-center" });
      handleDisconnect();
    }
  }, [isError]);

  if (isFetchingData) {
    return <LoadingScreen message="Fetching your profile information..." />;
  }

  return (
    <div className="min-h-screen bg-background text-white">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#1f2937", // Dark background
            color: "#fff", // White text
            borderRadius: "0.5rem",
            border: "1px solid #374151",
          },
          success: {
            iconTheme: {
              primary: "#10B981", // Green
              secondary: "#1f2937",
            },
          },
          error: {
            iconTheme: {
              primary: "#EF4444", // Red
              secondary: "#1f2937",
            },
          },
          loading: {
            iconTheme: {
              primary: "#6366F1", // Indigo/Primary color
              secondary: "#1f2937",
            },
          },
        }}
      />
      {!isConnected ? (
        <WelcomePage onConnect={handleConnect} />
      ) : isNewUser ? (
        <NewUserSetup
          onComplete={async () => {
            // When name is set, fetch fresh data and wait for results
            const success = await processUserData();
            if (success) {
              setIsNewUser(false);
            }
          }}
          onDisconnect={handleDisconnect}
        />
      ) : (
        <Dashboard
          address={userAddress}
          userData={userData}
          onDisconnect={handleDisconnect}
          refreshData={refreshData}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
