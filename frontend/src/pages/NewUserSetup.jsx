import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";
import toast from "react-hot-toast";

function extractMainError(error) {
  if (!error) return null;
  
  // Log the full error for debugging
  console.error("Transaction error:", error);
  
  if (error.message?.includes("User rejected the request") || 
      error.message?.includes("User denied") ||
      error.message?.includes("rejected")) {
    return "Transaction rejected by user.";
  }
  
  if (error.message?.includes("insufficient funds")) {
    return "Insufficient funds for gas. Please add ETH to your wallet.";
  }
  
  if (error.message?.includes("gas required exceeds allowance")) {
    return "Gas estimation failed. Please try again.";
  }
  
  if (error.message?.includes("network")) {
    return "Network error. Please check your connection.";
  }
  
  // Return a more descriptive error
  const errorMessage = error.message || error.toString();
  return errorMessage || "Transaction failed. Please try again.";
}

const NewUserSetup = ({ onComplete, onDisconnect }) => {
  const [name, setName] = useState("");
  const [transactionStatus, setTransactionStatus] = useState("");
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  
  const {
    data: hash,
    error: writeError,
    isPending,
    writeContract,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: waitError,
  } = useWaitForTransactionReceipt({ hash });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      toast.error("Please enter a valid name (at least 2 characters)");
      return;
    }

    // Check if user is on the correct network (Local Anvil - 31337)
    if (chainId !== 31337) {
      toast.error(
        `Please switch to Local Anvil network (Chain ID: 31337). You are currently on Chain ID: ${chainId}`,
        { position: "top-center", duration: 5000 }
      );
      
      // Try to switch to the correct network
      try {
        await switchChain({ chainId: 31337 });
      } catch (err) {
        console.error("Failed to switch network:", err);
        toast.error(
          "Please manually add the Local Anvil network to MetaMask and switch to it.",
          { position: "top-center", duration: 6000 }
        );
      }
      return;
    }

    try {
      console.log("Attempting to write contract with:", { 
        address: CONTRACT_ADDRESS, 
        functionName: "resetName", 
        args: [name.trim()] 
      });
      
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "resetName",
        args: [name.trim()],
      });
    } catch (err) {
      console.error("Failed to write contract:", err);
      toast.error("Failed to initiate transaction", { position: "top-center" });
    }
  };

  // Handle transaction states
  useEffect(() => {
    if (isPending) {
      setTransactionStatus("Please sign the transaction in your wallet...");
      toast.loading("Please sign the transaction", {
        id: "txn",
        position: "top-center",
      });
    }
  }, [isPending]);

  useEffect(() => {
    if (isConfirming) {
      setTransactionStatus("Waiting for transaction confirmation...");
      toast.loading("Waiting for transaction confirmation", {
        id: "txn",
        position: "top-center",
      });
    }
  }, [isConfirming]);

  useEffect(() => {
    if (isConfirmed) {
      toast.success("Name set successfully!", {
        id: "txn",
        position: "top-center",
      });
      onComplete();
    }
  }, [isConfirmed]);

  useEffect(() => {
    if (writeError || waitError) {
      const error = writeError || waitError;
      const mainError = extractMainError(error);
      toast.error(mainError, {
        id: "txn",
        position: "top-center",
      });
      setTransactionStatus("");
      reset();
    }
  }, [writeError, waitError]);

  const isProcessing = isPending || isConfirming;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-background-light rounded-lg p-8 shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Welcome to AfterLife Protocol
        </h2>
        
        {/* Network Status Indicator */}
        <div className={`mb-4 p-3 rounded-lg text-center text-sm ${
          chainId === 31337 
            ? 'bg-green-900/30 border border-green-700/50 text-green-400' 
            : 'bg-red-900/30 border border-red-700/50 text-red-400'
        }`}>
          {chainId === 31337 ? (
            <span>✓ Connected to Local Anvil Network</span>
          ) : (
            <span>⚠ Please switch to Local Anvil Network (Chain ID: 31337)</span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Enter your name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-lg bg-background border border-gray-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              placeholder="Your name (min. 2 characters)"
              required
              minLength={2}
              disabled={isProcessing}
            />
          </div>

          <div className="flex flex-col gap-4">
            <button
              type="submit"
              disabled={!name.trim() || name.trim().length < 2 || isProcessing}
              className="w-full py-3 px-4 bg-primary hover:bg-primary-dark rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? transactionStatus : "Proceed"}
            </button>

            <button
              type="button"
              onClick={onDisconnect}
              disabled={isProcessing}
              className="w-full py-3 px-4 bg-red-500 hover:bg-red-600 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Disconnect Wallet
            </button>
          </div>
        </form>

        <p className="mt-4 text-sm text-gray-400 text-center">
          This name will be associated with your wallet address on the
          blockchain
        </p>
      </div>
    </div>
  );
};

export default NewUserSetup;
