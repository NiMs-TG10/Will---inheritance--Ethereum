import { useState, useEffect } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useEstimateGas,
} from "wagmi";
import { formatEther } from "viem";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../../config";
import Modal from "../Modal";
import Input from "../Input";
import Button from "../Button";
import toast from "react-hot-toast";

// Extract main error message
const extractMainError = (error) => {
  if (!error) return null;
  if (error.message?.includes("User rejected the request")) {
    return "Transaction rejected by user.";
  }
  return "Transaction failed.";
};

const ResetNameModal = ({ onClose, refreshData, setIsProcessing }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimatedGas, setEstimatedGas] = useState(null);

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

  // Estimate gas when name changes
  const { data: gasEstimate } = useEstimateGas({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "resetName",
    args: [name],
    enabled: !!name && !error,
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
        id: "resetName",
        position: "top-center",
      });
      setIsSubmitting(true);
      setIsProcessing(true);
    }
  }, [isPending]);

  useEffect(() => {
    if (isConfirming) {
      toast.loading("Waiting for transaction confirmation", {
        id: "resetName",
        position: "top-center",
      });
      setIsSubmitting(true);
      setIsProcessing(true);
    }
  }, [isConfirming]);

  useEffect(() => {
    if (isConfirmed) {
      toast.success("Transaction successful. Your name has been updated.", {
        id: "resetName",
        position: "top-center",
      });
      setName("");
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
        toast.error(mainError, { id: "resetName", position: "top-center" });
      }
      setIsSubmitting(false);
      setIsProcessing(false);
      reset();
    }
  }, [writeError, waitError]);

  const validateName = (value) => {
    // Reset error
    setError("");

    // Check if empty
    if (!value || value.trim() === "") {
      setError("Name is required");
      return false;
    }

    // Check minimum length (excluding spaces)
    if (value.trim().length < 2) {
      setError("Name must be at least 2 characters long");
      return false;
    }

    return true;
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    validateName(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateName(name)) {
      return;
    }

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "resetName",
        args: [name.trim()],
      });
    } catch (err) {
      toast.error("Failed to initiate transaction", { position: "top-center" });
    }
  };

  return (
    <Modal
      title="Reset Name"
      onClose={onClose}
      isProcessing={isSubmitting || isPending || isConfirming}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Input */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            New Name
          </label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={handleNameChange}
            placeholder="Enter your name"
            error={error}
            disabled={isSubmitting || isPending || isConfirming}
            className="w-full"
          />
        </div>

        {/* Gas Info */}
        {estimatedGas && (
          <div className="p-4 bg-background/40 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Estimated Gas</span>
              <span className="text-sm font-medium">
                {formatEther(estimatedGas)} ETH
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            type="submit"
            className="flex-1"
            disabled={
              isSubmitting || !!error || !name || isPending || isConfirming
            }
          >
            Reset Name
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

export default ResetNameModal;
