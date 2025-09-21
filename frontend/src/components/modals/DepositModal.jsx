import { useState, useEffect } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useEstimateGas,
  useBalance,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../../config";
import Modal from "../Modal";
import Input from "../Input";
import Button from "../Button";
import toast from "react-hot-toast";

// Helper function to validate Ethereum number format
const isValidEthereumNumber = (value) => {
  // Check if it's a valid decimal number with up to 18 decimal places
  const regex = /^\d*\.?\d{0,18}$/;
  return regex.test(value) && value !== ".";
};

// Extract main error message
const extractMainError = (error) => {
  if (!error) return null;
  if (error.message?.includes("User rejected the request")) {
    return "Transaction rejected by user.";
  }
  return "Transaction failed.";
};

const DepositModal = ({ onClose, address, refreshData, setIsProcessing }) => {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimatedGas, setEstimatedGas] = useState(null);

  const { data: balance } = useBalance({
    address,
    watch: true,
  });

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
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Estimate gas when amount changes
  const { data: gasEstimate } = useEstimateGas({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "deposit",
    value:
      amount && isValidEthereumNumber(amount) ? parseEther(amount) : undefined,
    enabled: !!amount && !error,
  });

  useEffect(() => {
    if (gasEstimate) {
      setEstimatedGas(gasEstimate);
    }
  }, [gasEstimate]);

  // Handle transaction states
  useEffect(() => {
    if (isPending) {
      toast.loading("Please sign the transaction", {
        id: "deposit",
        position: "top-center",
      });
      setIsSubmitting(true);
      setIsProcessing(true);
    }
  }, [isPending]);

  useEffect(() => {
    if (isConfirming) {
      toast.loading("Waiting for transaction confirmation", {
        id: "deposit",
        position: "top-center",
      });
      setIsSubmitting(true);
      setIsProcessing(true);
    }
  }, [isConfirming]);

  useEffect(() => {
    if (isConfirmed) {
      toast.success("Deposit successful. Funds have been added to your will.", {
        id: "deposit",
        position: "top-center",
      });
      setAmount("");
      setIsSubmitting(false);
      setIsProcessing(false);
      reset();
      refreshData();
      onClose();
    }
  }, [isConfirmed]);

  useEffect(() => {
    if (writeError || waitError) {
      const error = writeError || waitError;
      const mainError = extractMainError(error);
      if (mainError) {
        toast.error(mainError, { id: "deposit", position: "top-center" });
      }
      setIsSubmitting(false);
      setIsProcessing(false);
      reset();
    }
  }, [writeError, waitError]);

  const validateAmount = (value) => {
    // Reset error
    setError("");

    // Check if empty
    if (!value) {
      setError("Amount is required");
      return false;
    }

    // Check if valid Ethereum number format
    if (!isValidEthereumNumber(value)) {
      setError("Invalid number format");
      return false;
    }

    // Check if greater than 0
    const parsedAmount = parseFloat(value);
    if (parsedAmount <= 0) {
      setError("Amount must be greater than 0");
      return false;
    }

    // Check if exceeds wallet balance
    const maxAmount = formatEther(balance?.value || 0n);
    if (parsedAmount > parseFloat(maxAmount)) {
      setError("Amount exceeds wallet balance");
      return false;
    }

    return true;
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;

    // Only update if it's a valid number format or empty
    if (value === "" || isValidEthereumNumber(value)) {
      setAmount(value);
      validateAmount(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAmount(amount)) {
      return;
    }

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "deposit",
        value: parseEther(amount),
      });
    } catch (err) {
      toast.error("Failed to initiate transaction", { position: "top-center" });
    }
  };

  return (
    <Modal
      title="Deposit ETH"
      onClose={onClose}
      isProcessing={isSubmitting || isPending || isConfirming}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount Input */}
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Amount (ETH)
          </label>
          <Input
            id="amount"
            type="text"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0.0"
            error={error}
            disabled={isSubmitting || isPending || isConfirming}
            className="w-full"
          />
        </div>

        {/* Balance and Gas Info */}
        <div className="p-4 bg-background/40 rounded-xl space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Wallet Balance</span>
            <span className="text-sm font-medium">
              {formatEther(balance?.value || 0n)} ETH
            </span>
          </div>
          {estimatedGas && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Estimated Gas</span>
              <span className="text-sm font-medium">
                {formatEther(estimatedGas)} ETH
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            type="submit"
            className="flex-1"
            disabled={
              isSubmitting || !!error || !amount || isPending || isConfirming
            }
          >
            Deposit
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isSubmitting || isPending || isConfirming}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DepositModal;
