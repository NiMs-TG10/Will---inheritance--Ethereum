import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatEther } from "viem";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";
import Button from "../components/Button";
import toast from "react-hot-toast";
import DepositModal from "../components/modals/DepositModal";
import WithdrawModal from "../components/modals/WithdrawModal";
import ManageNomineesModal from "../components/modals/ManageNomineesModal";
import TimeModal from "../components/modals/TimeModal";
import ResetNameModal from "../components/modals/ResetNameModal";
import ClaimInheritanceModal from "../components/modals/ClaimInheritanceModal";

const formatApproximateDuration = (days) => {
  const years = Math.floor(days / 365);
  const remainingDaysAfterYears = days % 365;
  const months = Math.floor(remainingDaysAfterYears / 30);
  const remainingDays = remainingDaysAfterYears % 30;

  // if only days are there, we dont need to write (~days)
  if (years === 0 && months === 0) {
    return "";
  }

  const parts = [];
  if (years > 0) parts.push(`${years} year${years > 1 ? "s" : ""}`);
  if (months > 0) parts.push(`${months} month${months > 1 ? "s" : ""}`);
  if (remainingDays > 0)
    parts.push(`${remainingDays} day${remainingDays > 1 ? "s" : ""}`);

  return parts.length > 0 ? `(~${parts.join(", ")})` : "";
};

const formatTimeWithExactAndApprox = (seconds, shouldRoundUp = false) => {
  const SECONDS_PER_DAY = 24 * 60 * 60;
  let days;

  if (shouldRoundUp) {
    // For Time Until Unlock: round up if there are any remaining seconds
    days =
      Number(seconds) % SECONDS_PER_DAY === 0
        ? Math.floor(Number(seconds) / SECONDS_PER_DAY)
        : Math.ceil(Number(seconds) / SECONDS_PER_DAY);
  } else {
    // For Inactivity Period: always use floor
    days = Math.floor(Number(seconds) / SECONDS_PER_DAY);
  }

  const approxFormat = formatApproximateDuration(days);
  return days > 1
    ? `${days} days ${approxFormat}`
    : `${days} day ${approxFormat}`;
};

const Dashboard = ({ address, userData, onDisconnect, refreshData }) => {
  const [activeTab, setActiveTab] = useState("will"); // 'will' or 'inheritance'
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isNomineeModalOpen, setIsNomineeModalOpen] = useState(false);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [isResetNameModalOpen, setIsResetNameModalOpen] = useState(false);
  const [selectedInheritance, setSelectedInheritance] = useState(null); // for inheritance claim
  const [isProcessingAlive, setIsProcessingAlive] = useState(false);
  const [isProcessingTransaction, setIsProcessingTransaction] = useState(false);

  //refresh data after every 5 minutes
  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshData();
    }, 300000); // 300000 ms = 5 minutes

    return () => clearInterval(intervalId);
  }, []);

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

  const handleIAmAlive = async () => {
    setIsProcessingAlive(true);

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "iAmAlive",
      });
    } catch (err) {
      toast.error("Failed to initiate transaction", { position: "top-center" });
      setIsProcessingAlive(false);
    }
  };

  // Handle transaction states for I Am Alive
  useEffect(() => {
    if (isPending) {
      toast.loading("Please sign the transaction", {
        id: "alive",
        position: "top-center",
      });
    }
  }, [isPending]);

  useEffect(() => {
    if (isConfirming) {
      toast.loading("Waiting for transaction confirmation", {
        id: "alive",
        position: "top-center",
      });
    }
  }, [isConfirming]);

  useEffect(() => {
    if (isConfirmed) {
      toast.success("Check-in successful! Your status has been updated.", {
        id: "alive",
        position: "top-center",
      });
      setIsProcessingAlive(false);
      reset();
      refreshData();
    }
  }, [isConfirmed]);

  useEffect(() => {
    if (writeError || waitError) {
      const error = writeError || waitError;
      let errorMessage = "Transaction failed";

      // Handle specific error cases
      if (
        error?.message?.includes("User rejected") ||
        error?.message?.includes("User denied")
      ) {
        errorMessage = "Transaction cancelled";
      } else if (error?.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for gas";
      } else if (error?.message?.includes("gas required exceeds allowance")) {
        errorMessage = "Gas estimation failed";
      }

      toast.error(errorMessage, { id: "alive", position: "top-center" });
      setIsProcessingAlive(false);
      reset();
    }
  }, [writeError, waitError]);

  return (
    <>
      <div
        className={`${
          isProcessingAlive || isProcessingTransaction
            ? "pointer-events-none select-none blur-[2px] opacity-75"
            : ""
        }`}
      >
        <div className="min-h-screen bg-background">
          {/* Header */}
          <header className="bg-background-light border-b border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Welcome, {userData?.name || "User"}
                  </h1>
                  <p className="text-gray-400 text-sm mt-1">
                    {userData?.isActive ? (
                      <span className="text-green-400">● Active</span>
                    ) : (
                      <span className="text-red-400">● Inactive</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={handleIAmAlive}
                    disabled={
                      !userData?.isActive ||
                      isProcessingAlive ||
                      isProcessingTransaction
                    }
                    isLoading={isProcessingAlive}
                  >
                    I Am Alive
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={onDisconnect}
                    disabled={isProcessingAlive || isProcessingTransaction}
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Tabs */}
            <div className="flex gap-4 mb-8">
              <Button
                variant={activeTab === "will" ? "primary" : "outline"}
                onClick={() => setActiveTab("will")}
                disabled={isProcessingAlive || isProcessingTransaction}
              >
                My Will
              </Button>
              <Button
                variant={activeTab === "inheritance" ? "primary" : "outline"}
                onClick={() => setActiveTab("inheritance")}
                disabled={isProcessingAlive || isProcessingTransaction}
              >
                My Inheritance
              </Button>
            </div>

            {/* Content */}
            {activeTab === "will" ? (
              <WillTab
                userData={userData}
                onDeposit={() => setIsDepositModalOpen(true)}
                onWithdraw={() => setIsWithdrawModalOpen(true)}
                onManageNominees={() => setIsNomineeModalOpen(true)}
                onManageTime={() => setIsTimeModalOpen(true)}
                onResetName={() => setIsResetNameModalOpen(true)}
                isProcessing={isProcessingAlive || isProcessingTransaction}
              />
            ) : (
              <InheritanceTab
                inheritances={userData?.inheritances}
                isProcessing={isProcessingAlive || isProcessingTransaction}
                onWithdraw={(inheritance) => {
                  setSelectedInheritance(inheritance);
                }}
              />
            )}
          </main>
        </div>
      </div>

      {isDepositModalOpen && (
        <DepositModal
          onClose={() => setIsDepositModalOpen(false)}
          address={address}
          refreshData={refreshData}
          setIsProcessing={setIsProcessingTransaction}
        />
      )}

      {isWithdrawModalOpen && (
        <WithdrawModal
          onClose={() => setIsWithdrawModalOpen(false)}
          totalDeposit={userData?.balance}
          refreshData={refreshData}
          setIsProcessing={setIsProcessingTransaction}
        />
      )}

      {isNomineeModalOpen && (
        <ManageNomineesModal
          onClose={() => setIsNomineeModalOpen(false)}
          currentNominees={userData?.nominees}
          refreshData={refreshData}
          setIsProcessing={setIsProcessingTransaction}
        />
      )}

      {isTimeModalOpen && (
        <TimeModal
          onClose={() => setIsTimeModalOpen(false)}
          refreshData={refreshData}
          setIsProcessing={setIsProcessingTransaction}
        />
      )}

      {isResetNameModalOpen && (
        <ResetNameModal
          onClose={() => setIsResetNameModalOpen(false)}
          refreshData={refreshData}
          setIsProcessing={setIsProcessingTransaction}
        />
      )}

      {/* Claim Inheritance Modal */}
      {selectedInheritance && (
        <ClaimInheritanceModal
          onClose={() => setSelectedInheritance(null)}
          depositorAddress={selectedInheritance.depositorAddress}
          maxAmount={selectedInheritance.absoluteShareAmount}
          refreshData={refreshData}
          setIsProcessing={setIsProcessingTransaction}
        />
      )}
    </>
  );
};

const WillTab = ({
  userData,
  onDeposit,
  onWithdraw,
  onManageNominees,
  onManageTime,
  onResetName,
  isProcessing,
}) => {
  const [lastCheckInDisplay, setLastCheckInDisplay] = useState("");

  // Helper function to format time period
  const formatTimePeriod = (seconds) => {
    const totalSeconds = Math.floor(Number(seconds));
    const years = Math.floor(totalSeconds / (365 * 24 * 60 * 60));
    const months = Math.floor(
      (totalSeconds % (365 * 24 * 60 * 60)) / (30 * 24 * 60 * 60)
    );
    const days = Math.floor(
      (totalSeconds % (30 * 24 * 60 * 60)) / (24 * 60 * 60)
    );
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);

    const parts = [];
    if (years > 0) parts.push(`${years} year${years > 1 ? "s" : ""}`);
    if (months > 0) parts.push(`${months} month${months > 1 ? "s" : ""}`);
    if (days > 0) parts.push(`${days} day${days > 1 ? "s" : ""}`);
    if (hours > 0 && years === 0 && months === 0)
      parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
    if (minutes > 0 && years === 0 && months === 0 && days === 0)
      parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);

    if (parts.length === 0) {
      return "few moments";
    }

    return parts.join(", ");
  };

  // Calculate and update time since last check-in every 30 seconds
  useEffect(() => {
    if (!userData?.lastCheckIn) {
      setLastCheckInDisplay("Never");
      return;
    }

    // Function to update the display
    const updateDisplay = () => {
      const lastCheckInTime = Number(userData.lastCheckIn) * 1000; // Convert to milliseconds
      const now = Date.now();
      const diffInSeconds = Math.floor((now - lastCheckInTime) / 1000);
      const formattedTime = formatTimePeriod(diffInSeconds);
      setLastCheckInDisplay(
        formattedTime === "few moments"
          ? "few moments ago"
          : `${formattedTime} ago`
      );
    };

    // Update immediately
    updateDisplay();

    // Set up interval to update every 30 seconds
    const intervalId = setInterval(updateDisplay, 30000);

    // Cleanup interval on unmount or when lastCheckIn changes
    return () => clearInterval(intervalId);
  }, [userData?.lastCheckIn]);

  // Calculate total share percentage allocated to nominees
  const totalSharePercentage =
    (
      userData?.nominees?.reduce(
        (sum, nominee) => sum + Number(nominee.sharePercent || 0),
        0
      ) / 100
    ).toFixed(2) || 0;

  if (!userData?.isActive) {
    return (
      <div className="border border-red-600 rounded-2xl bg-red-900/10 p-8 text-center shadow-inner shadow-red-500/20">
        <h2 className="text-3xl font-bold text-red-500 mb-2">
          ⚠️ Access Locked
        </h2>
        <p className="text-lg text-gray-300">
          You have been marked{" "}
          <span className="text-red-500 font-semibold">inactive</span> for
          longer than your chosen inactivity period.
        </p>
        <p className="text-gray-400">
          Your funds are now{" "}
          <span className="text-yellow-400 font-medium">locked</span> in the
          protocol. Only your nominees can claim them.
        </p>

        <div className="mt-6 bg-red-800/30 backdrop-blur-sm p-4 rounded-lg border border-red-700/40 shadow-md space-y-2 text-sm text-gray-200 max-w-xl mx-auto">
          <ul className="text-left list-disc list-inside text-sm text-gray-400 max-w-2md mx-auto space-y-2">
            <li>⚠️ You can no longer deposit or withdraw funds.</li>
            <li>⚠️ You cannot update nominees or settings.</li>
            <li>
              ⚠️ You cannot interact with the contract using the "I Am Alive"
              button.
            </li>
            <li>
              ✅ You can still claim inheritance in the "My Inheritance" tab.
            </li>
          </ul>
        </div>
        <p className="text-gray-500 text-sm mt-6 italic">
          This restriction ensures your assets are safely transferred to your
          nominees.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-blue-900/20 p-8">
        <div className="absolute inset-0 bg-background/40 backdrop-blur-xl" />
        <div className="relative z-10">
          <div className="text-center space-y-6 py-8">
            <h2 className="text-2xl font-medium text-gray-400">
              Total Deposit
            </h2>
            <p className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-400 to-primary">
              {formatEther(userData?.balance || 0n)} ETH
            </p>
          </div>
          <div className="max-w-md mx-auto grid grid-cols-2 gap-6 mt-8">
            <Button
              onClick={onDeposit}
              className="py-4 text-lg font-medium shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              disabled={!userData?.isActive || isProcessing}
            >
              Deposit
            </Button>
            <Button
              onClick={onWithdraw}
              variant="secondary"
              className="py-4 text-lg font-medium shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              disabled={!userData?.isActive || isProcessing}
            >
              Withdraw
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-8">
          {/* Nominees Section */}
          <div className="bg-background-light rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Nominees</h2>
              <Button
                onClick={onManageNominees}
                variant="outline"
                className="transition-all hover:bg-primary/10"
                disabled={!userData?.isActive || isProcessing}
              >
                Manage Nominees
              </Button>
            </div>

            {/* Progress Section */}
            <div className="bg-background/40 rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Allocation</span>
                <span className="text-lg font-semibold">
                  {totalSharePercentage}%
                </span>
              </div>
              <div className="relative h-3">
                <div className="absolute inset-0 bg-gray-700/30 rounded-full overflow-hidden backdrop-blur-sm">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${totalSharePercentage}%` }}
                  />
                </div>
              </div>
              {totalSharePercentage === 0 ? (
                <p className="text-yellow-400 text-sm">
                  Warning: You have not allocated any portion of your deposit.
                  Please add nominees to ensure that your funds are
                  appropriately distributed in the event of your inactivity.
                </p>
              ) : (
                totalSharePercentage < 100 && (
                  <p className="text-yellow-400 text-sm">
                    Warning: Only {totalSharePercentage}% of your wealth is
                    allocated. The remaining {100 - totalSharePercentage}% will
                    be locked in the contract if you become inactive.
                  </p>
                )
              )}
            </div>

            {/* Nominees List */}
            <div className="space-y-3 mt-4">
              {userData?.nominees?.map((nominee, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 bg-background/40 rounded-xl backdrop-blur-sm transition-all hover:bg-background-light border border-gray-800"
                >
                  <div>
                    <p className="font-medium">{nominee.name}</p>
                    <p className="text-sm text-gray-400">{nominee.relation}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {(Number(nominee.sharePercent) / 100).toFixed(2)}%
                    </p>
                    <p className="text-sm text-gray-400 truncate max-w-[200px]">
                      {nominee.nomineeAddress}
                    </p>
                  </div>
                </div>
              ))}
              {(!userData?.nominees || userData.nominees.length === 0) && (
                <div className="text-center py-12 bg-background/40 rounded-xl border border-gray-800">
                  <p className="text-gray-400">No nominees added yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-8">
          {/* Activity Timeline */}
          <div className="bg-background-light rounded-2xl p-6 space-y-6">
            <h2 className="text-xl font-semibold">Activity Timeline</h2>
            <div className="space-y-6">
              <div className="bg-background/40 rounded-xl p-4 border border-gray-800">
                <h3 className="text-sm font-medium text-gray-400 mb-2">
                  Inactivity Period
                </h3>
                <p className="text-xl font-semibold">
                  {formatTimeWithExactAndApprox(
                    userData?.inactivityPeriod || 0
                  )}
                </p>
              </div>
              <div className="bg-background/40 rounded-xl p-4 border border-gray-800">
                <h3 className="text-sm font-medium text-gray-400 mb-2">
                  Last Check-In
                </h3>
                <p className="text-xl font-semibold">{lastCheckInDisplay}</p>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-background-light rounded-2xl p-6 space-y-6">
            <h2 className="text-xl font-semibold">Settings</h2>
            <div className="space-y-4">
              <Button
                onClick={onResetName}
                variant="outline"
                className="w-full transition-all hover:bg-primary/10"
                disabled={!userData?.isActive || isProcessing}
              >
                Reset Name
              </Button>
              <Button
                onClick={onManageTime}
                variant="outline"
                className="w-full transition-all hover:bg-primary/10"
                disabled={!userData?.isActive || isProcessing}
              >
                Reset Inactivity Period
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Section */}
      <div className="relative overflow-hidden rounded-2xl">
        <div className="p-8 bg-red-900/20 backdrop-blur-sm border border-red-700 rounded-2xl">
          <h3 className="text-xl font-semibold text-red-400 mb-4">
            Inactivity Warning
          </h3>
          <p className="text-gray-300">
            If you remain inactive for longer than{" "}
            {userData?.inactivityPeriod
              ? formatTimePeriod(userData.inactivityPeriod)
              : "your inactivity period"}
            , you will:
          </p>
          <ul className="list-disc list-inside text-gray-300 mt-4 space-y-2">
            <li>Lose ability to deposit or withdraw</li>
            <li>Cannot modify nominees or settings</li>
            <li>Cannot mark yourself as active</li>
            <li>Nominees can claim their allocated shares</li>
          </ul>
          <div className="mt-6 p-4 bg-green-900/20 rounded-xl backdrop-blur-sm border border-green-700">
            <p className="text-green-400">
              If you do not wish to make any updates, you can simply click the
              "I Am Alive" button to notify the protocol that you are still
              active.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const InheritanceTab = ({ inheritances = [], isProcessing, onWithdraw }) => {
  const [sortBy, setSortBy] = useState("timeUntilUnlock");
  const [sortOrder, setSortOrder] = useState("asc");

  // Sort inheritances
  const sortedInheritances = [...inheritances].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case "timeUntilUnlock":
        comparison = Number(a.timeUntilUnlock - b.timeUntilUnlock);
        break;
      case "amount":
        comparison = Number(a.absoluteShareAmount - b.absoluteShareAmount);
        break;
      case "sharePercent":
        comparison = Number(a.sharePercent - b.sharePercent);
        break;
      case "name":
        comparison = a.depositorName.localeCompare(b.depositorName);
        break;
      default:
        comparison = Number(a.timeUntilUnlock - b.timeUntilUnlock);
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const formatTimeUntilUnlock = (timeInSeconds) => {
    return formatTimeWithExactAndApprox(timeInSeconds, true); // true for rounding up
  };

  const formatInactivityPeriod = (seconds) => {
    return formatTimeWithExactAndApprox(seconds, false); // false for exact days
  };

  return (
    <div className="space-y-6">
      {/* Header with Sorting Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Your Incoming Inheritances</h2>
        <div className="flex gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            disabled={isProcessing}
            className="bg-background-light border border-gray-600 rounded-lg px-4 py-2"
          >
            <option value="timeUntilUnlock">Sort by Time Until Unlock</option>
            <option value="amount">Sort by Amount</option>
            <option value="sharePercent">Sort by Share Percentage</option>
            <option value="name">Sort by Depositor Name</option>
          </select>
          <button
            onClick={() =>
              setSortOrder((order) => (order === "asc" ? "desc" : "asc"))
            }
            className="bg-background-light border border-gray-600 rounded-lg px-4 py-2 hover:bg-gray-700"
            disabled={isProcessing}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>

      {/* Inheritance Cards */}
      <div className="grid grid-cols-1 gap-6">
        {sortedInheritances.map((inheritance, index) => {
          const sharePercent = (Number(inheritance.sharePercent) / 100).toFixed(
            2
          );

          return (
            <div
              key={index}
              className="bg-background-light rounded-xl p-6 space-y-4"
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">
                    {inheritance.depositorName}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1 break-all">
                    {inheritance.depositorAddress}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold text-primary">
                    {formatEther(inheritance.absoluteShareAmount)} ETH
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {sharePercent}% Share
                  </p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-background/40 rounded-lg">
                <div>
                  <p className="text-sm text-gray-400">Inactivity Period</p>
                  <p className="font-medium">
                    {formatInactivityPeriod(
                      inheritance.inactivityThresholdPeriod
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Time Until Unlock</p>
                  <p className="font-medium">
                    {formatTimeUntilUnlock(inheritance.timeUntilUnlock)}
                  </p>
                </div>
              </div>

              {/* Status and Action */}
              <div className="flex justify-between items-center">
                <div
                  className={`flex items-center gap-2 ${
                    inheritance.isLocked ? "text-yellow-400" : "text-green-400"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      inheritance.isLocked ? "bg-yellow-400" : "bg-green-400"
                    }`}
                  />
                  <span>
                    {inheritance.isLocked ? "Locked" : "Available to Claim"}
                  </span>
                </div>
                {!inheritance.isLocked && (
                  <Button
                    onClick={() => {
                      onWithdraw(inheritance);
                    }}
                    disabled={isProcessing}
                  >
                    Claim
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {inheritances.length === 0 && (
          <div className="text-center py-12 bg-background-light rounded-xl">
            <p className="text-gray-400 text-lg">
              You have no incoming inheritances
            </p>
            <p className="text-gray-500 text-sm mt-2">
              When someone adds you as their nominee, their inheritance details
              will appear here
            </p>
          </div>
        )}
      </div>

      {/* Information Section */}
      <div className="mt-8 p-6 bg-blue-900/20 border border-blue-800 rounded-xl">
        <h3 className="text-lg font-semibold text-blue-400 mb-4">
          How Inheritance Works
        </h3>
        <div className="space-y-4 text-gray-300">
          <p>
            The deposited amount will only be unlocked after the "Time Until
            Unlock" period has passed, and only if the depositor has remained
            inactive throughout this entire duration.
          </p>
          <p className="text-sm text-blue-400 mt-4">
            Should the depositor interact with the protocol at any point during
            this period, the "Time Until Unlock" duration will reset to the full
            designated "Inactivity Period".
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
