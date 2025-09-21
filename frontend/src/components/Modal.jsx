import { useEffect } from "react";
import Button from "./Button";

const Modal = ({ title, children, onClose, isProcessing }) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleBackdropClick = (e) => {
    if (!isProcessing) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 ${
          isProcessing ? "cursor-not-allowed" : ""
        }`}
        onClick={handleBackdropClick}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 ">
        <div className="flex min-h-full items-center justify-center p-4 ">
          <div
            className="bg-background-light border border-gray-700 rounded-xl shadow-xl w-full max-w-lg "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-700 ">
              <h2 className="text-xl font-semibold">{title}</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                disabled={isProcessing}
                className="w-8 h-8 rounded-full hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✕
              </Button>
            </div>

            {/* Content */}
            <div className="p-6">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;
