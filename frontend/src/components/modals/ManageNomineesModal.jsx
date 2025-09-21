import { useState, useEffect } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useEstimateGas,
} from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../../config";
import { isAddress, formatEther } from "viem";
import toast from "react-hot-toast";
import Modal from "../Modal";
import Button from "../Button";
import Input from "../Input";

function extractMainError(error) {
  if (!error) return null;
  if (
    error.message?.includes("User rejected") ||
    error.message?.includes("User denied")
  ) {
    return "Transaction cancelled by user";
  }
  return "Transaction failed";
}

const ManageNomineesModal = ({
  onClose,
  currentNominees,
  refreshData,
  setIsProcessing,
}) => {
  const [nominees, setNominees] = useState([]);
  const [totalShare, setTotalShare] = useState(0);
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

  const hasErrors = () => {
    return (
      nominees.some(
        (nominee) =>
          Object.values(nominee.errors || {}).some((error) => error !== "") ||
          !nominee.name ||
          !nominee.relation ||
          !nominee.address ||
          !nominee.sharePercent
      ) || totalShare > 100
    );
  };

  const { data: gasEstimate } = useEstimateGas({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "updateNominees",
    args: nominees.length
      ? [
          nominees.map((n) => n.address),
          nominees.map((n) => n.name),
          nominees.map((n) => n.relation),
          nominees.map((n) =>
            Math.round(parseFloat(n.sharePercent || 0) * 100).toString()
          ),
        ]
      : undefined,
    query: {
      enabled: nominees.length > 0 && !hasErrors() && totalShare <= 100,
    },
  });

  useEffect(() => {
    if (gasEstimate) {
      setEstimatedGas(gasEstimate);
    }
  }, [gasEstimate]);

  useEffect(() => {
    if (currentNominees) {
      setNominees(
        currentNominees.map((nominee) => ({
          name: nominee.name,
          relation: nominee.relation,
          address: nominee.nomineeAddress,
          sharePercent: (Number(nominee.sharePercent) / 100).toFixed(2),
          errors: {
            name: "",
            relation: "",
            address: "",
            sharePercent: "",
          },
        }))
      );
    }
  }, [currentNominees]);

  useEffect(() => {
    const sum = nominees.reduce(
      (acc, nominee) => acc + (parseFloat(nominee.sharePercent) || 0),
      0
    );
    setTotalShare(Number(sum.toFixed(2)));
  }, [nominees]);

  // Handle transaction states
  useEffect(() => {
    if (isPending) {
      toast.loading("Please sign the transaction", {
        id: "nominee-update",
        position: "top-center",
      });
      setIsSubmitting(true);
      setIsProcessing(true);
    }
  }, [isPending]);

  useEffect(() => {
    if (isConfirming) {
      toast.loading("Waiting for transaction confirmation", {
        id: "nominee-update",
        position: "top-center",
      });
      setIsSubmitting(true);
      setIsProcessing(true);
    }
  }, [isConfirming]);

  useEffect(() => {
    if (isConfirmed) {
      toast.success(
        "Transaction successful. Your Nominee list along with its details has been updated.",
        {
          id: "nominee-update",
          position: "top-center",
        }
      );
      setNominees([]);
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
        toast.error(mainError, {
          id: "nominee-update",
          position: "top-center",
        });
      }
      setIsSubmitting(false);
      setIsProcessing(false);
      reset();
    }
  }, [writeError, waitError]);

  const validateNominee = (nominee, index, allNominees) => {
    const errors = {
      name: "",
      relation: "",
      address: "",
      sharePercent: "",
    };

    // Name validation
    if (!nominee.name?.trim() || nominee.name.trim().length < 2) {
      errors.name = "Name must be atleast 2 characters long";
    }

    // Relation validation
    if (!nominee.relation?.trim() || nominee.relation.trim().length < 2) {
      errors.relation = "Relation must be atleast 2 characters long";
    }

    // Address validation
    if (!nominee.address || !isAddress(nominee.address)) {
      errors.address = "Invalid wallet address";
    } else if (
      nominee.address.toLowerCase() ===
      window.ethereum?.selectedAddress?.toLowerCase()
    ) {
      errors.address = "Cannot use your own address as nominee";
    }

    // Share percent validation
    const share = parseFloat(nominee.sharePercent);
    if (isNaN(share) || share <= 0 || share > 100) {
      errors.sharePercent = "Share must be between 0 and 100 (0 excluded)";
    } else {
      const totalOtherShares = allNominees.reduce(
        (acc, nom, i) =>
          i !== index ? acc + (parseFloat(nom.sharePercent) || 0) : acc,
        0
      );
      if (share + totalOtherShares > 100) {
        errors.sharePercent = "Total share cannot exceed 100%";
      }
    }

    return errors;
  };

  const handleInputChange = (index, field, value) => {
    const updatedNominees = [...nominees];

    if (field === "sharePercent") {
      // Format to 2 decimal places
      const formattedValue =
        value === "" ? "" : Number(parseFloat(value).toFixed(2)).toString();
      updatedNominees[index] = {
        ...updatedNominees[index],
        [field]: formattedValue,
      };
    } else {
      updatedNominees[index] = {
        ...updatedNominees[index],
        [field]: value,
      };
    }

    // Validate the changed nominee
    updatedNominees[index].errors = validateNominee(
      updatedNominees[index],
      index,
      updatedNominees
    );

    setNominees(updatedNominees);
  };

  const handleAddNominee = () => {
    if (nominees.length === 30) {
      toast.error("Maximum 30 nominees allowed");
      return;
    }

    setNominees([
      ...nominees,
      {
        name: "",
        relation: "",
        address: "",
        sharePercent: "",
        errors: {
          name: "",
          relation: "",
          address: "",
          sharePercent: "",
        },
      },
    ]);

    // Scroll to bottom after state update
    setTimeout(() => {
      const modalContent = document.querySelector(".nominees-modal-content");
      if (modalContent) {
        modalContent.scrollTop = modalContent.scrollHeight;
      }
    }, 0);
  };

  const handleDeleteNominee = (index) => {
    const updatedNominees = nominees.filter((_, i) => i !== index);
    setNominees(updatedNominees);
  };

  const handleUpdateNominees = () => {
    try {
      // Format nominees array according to the contract's Nominee struct
      const formattedNominees = nominees.map((nominee) => ({
        name: nominee.name.trim(),
        relation: nominee.relation.trim(),
        nomineeAddress: nominee.address,
        sharePercent: Math.round(
          parseFloat(nominee.sharePercent) * 100
        ).toString(), // Convert to basis points (e.g., 25.50% -> 2550)
      }));

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "updateNominees",
        args: [formattedNominees],
      });
    } catch (err) {
      toast.error("Failed to initiate transaction", { position: "top-center" });
    }
  };

  return (
    <Modal
      title="Manage Nominees"
      onClose={onClose}
      isProcessing={isSubmitting || isPending || isConfirming}
    >
      <div className="flex flex-col h-full w-full max-h-[73vh] overflow-y-auto">
        {/* Scrollable content */}
        <div className="nominees-modal-content flex-1 overflow-y-auto p-4 space-y-2">
          {nominees.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>You currently have no nominees.</p>
              <p className="text-sm mt-2">
                Click 'Add New Nominee' below to start adding nominees.
              </p>
            </div>
          ) : (
            nominees.map((nominee, index) => (
              <div
                key={index}
                className="mb-6 p-4 bg-background/40 rounded-xl space-y-2"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium mb-1"
                    >
                      Name
                    </label>
                    <Input
                      id="name"
                      type="text"
                      value={nominee.name}
                      onChange={(e) =>
                        handleInputChange(index, "name", e.target.value)
                      }
                      placeholder="Nominee's name"
                      // error={error}
                      disabled={isSubmitting || isPending || isConfirming}
                    />
                    {nominee.errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {nominee.errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="relation"
                      className="block text-sm font-medium mb-1"
                    >
                      Relation
                    </label>
                    <Input
                      id="relation"
                      type="text"
                      value={nominee.relation}
                      onChange={(e) =>
                        handleInputChange(index, "relation", e.target.value)
                      }
                      placeholder="Relation with nominee"
                      disabled={isSubmitting || isPending || isConfirming}
                    />
                    {nominee.errors.relation && (
                      <p className="text-red-500 text-sm mt-1">
                        {nominee.errors.relation}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="walletAddress"
                      className="block text-sm font-medium mb-1"
                    >
                      Wallet Address
                    </label>
                    <Input
                      id="walletAddress"
                      type="text"
                      value={nominee.address}
                      onChange={(e) =>
                        handleInputChange(index, "address", e.target.value)
                      }
                      placeholder="0x..."
                      disabled={isSubmitting || isPending || isConfirming}
                    />
                    {nominee.errors.address && (
                      <p className="text-red-500 text-sm mt-1">
                        {nominee.errors.address}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="sharePercentage"
                      className="block text-sm font-medium mb-1"
                    >
                      Share Percentage
                    </label>
                    <Input
                      id="sharePercentage"
                      type="number"
                      value={nominee.sharePercent}
                      onChange={(e) =>
                        handleInputChange(index, "sharePercent", e.target.value)
                      }
                      placeholder="Share percentage"
                      disabled={isSubmitting || isPending || isConfirming}
                      step="0.01"
                      min="0"
                      max="100"
                      onBlur={(e) => {
                        if (e.target.value !== "") {
                          handleInputChange(
                            index,
                            "sharePercent",
                            parseFloat(e.target.value).toFixed(2)
                          );
                        }
                      }}
                    />
                    {nominee.errors.sharePercent && (
                      <p className="text-red-500 text-sm mt-1">
                        {nominee.errors.sharePercent}
                      </p>
                    )}
                  </div>
                </div>

                {!(isSubmitting || isPending || isConfirming) && (
                  <Button
                    onClick={() => handleDeleteNominee(index)}
                    variant="outline"
                  >
                    Delete Nominee
                  </Button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Fixed bottom section */}
        <div className="border-t border-gray-700 p-2">
          <div className="space-y-2 mb-4 p-4 bg-background/40 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span>Total Share Allocated:</span>
              <span
                className={
                  totalShare > 100
                    ? "text-red-500"
                    : totalShare === 100
                    ? "text-green-500"
                    : "text-yellow-500"
                }
              >
                {totalShare}%
              </span>
            </div>

            {estimatedGas && (
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span>Estimated Gas Fee:</span>
                <span>{formatEther(estimatedGas)} ETH</span>
              </div>
            )}

            {totalShare === 0 ? (
              <p className="text-yellow-400 text-sm">
                Warning: You have not allocated any portion of your deposit.
                Please add nominees to ensure that your funds are appropriately
                distributed in the event of your inactivity.
              </p>
            ) : (
              totalShare < 100 && (
                <p className="text-yellow-400 text-sm">
                  Warning: Only {totalShare}% of your wealth is allocated. The
                  remaining {(100 - totalShare).toFixed(2)}% will be locked in
                  the contract if you become inactive.
                </p>
              )
            )}
            {totalShare > 100 && (
              <p className="text-red-500 text-sm">
                Error: Total allocation exceeds 100%. Please adjust the share
                percentages.
              </p>
            )}
          </div>

          <div className="flex justify-between gap-4">
            <Button
              onClick={handleUpdateNominees}
              disabled={
                isSubmitting || isPending || isConfirming || hasErrors()
              }
              className="flex-1"
            >
              Update Nominees
            </Button>
            <Button
              onClick={handleAddNominee}
              disabled={
                isSubmitting ||
                isPending ||
                isConfirming ||
                nominees.length >= 30
              }
              className="flex-1"
              variant="outline"
            >
              Add New Nominee
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ManageNomineesModal;
