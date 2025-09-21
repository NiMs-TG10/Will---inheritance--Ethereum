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

// Constants for validation
const MIN_DAYS = 3;
const MAX_YEARS = 20;
const MAX_DAYS = MAX_YEARS * 365;
const SECONDS_PER_DAY = 24 * 60 * 60;

// Quick selection options
const TIME_OPTIONS = [
  { label: "1 Year", days: 365 },
  { label: "2 Years", days: 730 },
  { label: "5 Years", days: 1825 },
  { label: "20 Years", days: 7300 },
];

const TimeModal = ({ onClose, refreshData, setIsProcessing }) => {
  const [days, setDays] = useState("");
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

  // Estimate gas when days changes
  const { data: gasEstimate } = useEstimateGas({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "setInactivityPeriod",
    args: [
      days ? BigInt(Math.floor(Number(days)) * SECONDS_PER_DAY) : undefined,
    ],
    enabled: !!days && !error,
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
        id: "setTime",
        position: "top-center",
      });
      setIsSubmitting(true);
      setIsProcessing(true);
    }
  }, [isPending]);

  useEffect(() => {
    if (isConfirming) {
      toast.loading("Waiting for transaction confirmation", {
        id: "setTime",
        position: "top-center",
      });
      setIsSubmitting(true);
      setIsProcessing(true);
    }
  }, [isConfirming]);

  useEffect(() => {
    if (isConfirmed) {
      toast.success(
        "Transaction successful. Your inactivity period has been reset.",
        { id: "setTime", position: "top-center" }
      );
      setDays("");
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
        toast.error(mainError, { id: "setTime", position: "top-center" });
      }
      setIsSubmitting(false);
      setIsProcessing(false);
      reset();
    }
  }, [writeError, waitError]);

  const validateDays = (value) => {
    // Reset error
    setError("");

    // Check if empty
    if (!value) {
      setError("Inactivity period is required");
      return false;
    }

    // Check if it's a valid number
    const numDays = Number(value);
    if (isNaN(numDays) || !Number.isInteger(numDays)) {
      setError("Please enter a whole number of days");
      return false;
    }

    // Check minimum days
    if (numDays < MIN_DAYS) {
      setError(`Minimum inactivity period is ${MIN_DAYS} days`);
      return false;
    }

    // Check maximum days
    if (numDays > MAX_DAYS) {
      setError(
        `Maximum inactivity period is ${MAX_YEARS} years (${MAX_DAYS} days)`
      );
      return false;
    }

    return true;
  };

  const handleDaysChange = (e) => {
    const value = e.target.value;
    // Only allow positive integers
    if (value === "" || /^\d+$/.test(value)) {
      setDays(value);
      validateDays(value);
    }
  };

  const handleQuickSelect = (selectedDays) => {
    setDays(selectedDays.toString());
    validateDays(selectedDays.toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateDays(days)) {
      return;
    }

    // Convert days to seconds for the contract
    const seconds = BigInt(Math.floor(Number(days)) * SECONDS_PER_DAY);

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "setInactivityPeriod",
        args: [seconds],
      });
    } catch (err) {
      toast.error("Failed to initiate transaction", { position: "top-center" });
    }
  };

  return (
    <Modal
      title="Reset Inactivity Period"
      onClose={onClose}
      isProcessing={isSubmitting || isPending || isConfirming}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Days Input */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="days"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Inactivity Period (in days)
            </label>
            <Input
              id="days"
              type="text"
              value={days}
              onChange={handleDaysChange}
              placeholder="Enter number of days"
              error={error}
              disabled={isSubmitting || isPending || isConfirming}
              className="w-full"
            />
            <p className="mt-2 text-sm text-gray-400">
              Must be between {MIN_DAYS} days and {MAX_YEARS} years ({MAX_DAYS}{" "}
              days)
            </p>
          </div>

          {/* Quick Selection Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Quick Select
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TIME_OPTIONS.map((option) => (
                <Button
                  key={option.days}
                  type="button"
                  variant="outline"
                  onClick={() => handleQuickSelect(option.days)}
                  disabled={isSubmitting || isPending || isConfirming}
                  className={`text-sm py-2 ${
                    days === option.days.toString() ? "bg-primary/10" : ""
                  }`}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
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
              isSubmitting || !!error || !days || isPending || isConfirming
            }
          >
            Reset Inactivity Period
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

export default TimeModal;
