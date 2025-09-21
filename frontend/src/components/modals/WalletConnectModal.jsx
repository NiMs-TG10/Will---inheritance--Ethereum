import Button from "../Button";
import ConnectWalletOptions from "../ConnectWalletOptions";

const WalletConnectModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background-light rounded-lg p-6 max-w-md w-full mx-4 relative">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Connect your wallet</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="!p-2"
          >
            ✕
          </Button>
        </div>

        <ConnectWalletOptions />
      </div>
    </div>
  );
};

export default WalletConnectModal;
