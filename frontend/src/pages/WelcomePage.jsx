import { useConnect, useAccount } from "wagmi";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import WalletConnectModal from "../components/modals/WalletConnectModal";
import LoadingScreen from "../components/LoadingScreen";
import { FaGithub, FaTwitter } from "react-icons/fa";

const WelcomePage = ({ onConnect }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useAccount();
  const { error } = useConnect({
    onSuccess: () => {
      setIsModalOpen(false);
      setIsLoading(true);
      // Give a small delay to ensure the connection is properly established
      setTimeout(() => {
        onConnect(address);
      }, 1000);
    },
  });

  useEffect(() => {
    if (error) {
      toast.error("Failed to connect wallet. Please try again.");
      setIsLoading(false);
      setIsModalOpen(false);
    }
  }, [error]);

  if (isLoading) {
    return <LoadingScreen message="Checking wallet status..." />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background-dark via-background to-background-light opacity-50"></div>
        <div className="relative z-10 max-w-4xl text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              AfterLife Protocol
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
            Secure your digital legacy and ensure your assets reach your loved
            ones. The future of inheritance, powered by blockchain.
          </p>
          <div className="flex flex-col items-center space-y-4">
            <p className="text-sm text-yellow-400 font-medium">
              ⚠️ This dApp works only on the Sepolia Testnet. Please switch your
              network before connecting.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-4 bg-primary hover:bg-primary-dark rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105"
            >
              Connect Wallet
            </button>
            <p className="text-sm text-gray-400">
              Your digital legacy, secured on the blockchain
            </p>
          </div>
        </div>
      </div>
      {/* Features Section */}
      <div className="bg-background-light py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose AfterLife Protocol?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              title="Secure Storage"
              description="Your assets are securely stored on the blockchain until your nominees can claim them."
              icon="🔒"
            />
            <FeatureCard
              title="Smart Distribution"
              description="Set up multiple nominees with custom share percentages for your assets."
              icon="📊"
            />
            <FeatureCard
              title="Full Control"
              description="Maintain complete control over your assets with regular check-ins."
              icon="🎯"
            />
          </div>
        </div>
      </div>
      {/* Wallet Connect Modal */}
      <WalletConnectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      {/* Footer Section */}
      <footer className="relative bg-gradient-to-r from-background via-background-light to-background border-t border-gray-700/30">
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark/20 to-transparent"></div>
        <div className="relative max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            {/* Brand & Copyright */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  AfterLife Protocol
                </span>
              </div>
              <p className="text-sm text-gray-400">
                © {new Date().getFullYear()} All rights reserved. Securing
                digital legacies.
              </p>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400 hidden md:block">
                Connect with us
              </span>
              <div className="flex space-x-4">
                <a
                  href="https://github.com/jai123singh/AfterLife-Protocol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center w-12 h-12 bg-gray-800/50 hover:bg-primary/20 rounded-full transition-all duration-300 transform hover:scale-110 border border-gray-700/30 hover:border-primary/50"
                  aria-label="GitHub"
                >
                  <FaGithub className="text-xl text-gray-400 group-hover:text-primary transition-colors duration-300" />
                </a>
                <a
                  href="https://x.com/JaiSingh9122"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center w-12 h-12 bg-gray-800/50 hover:bg-secondary/20 rounded-full transition-all duration-300 transform hover:scale-110 border border-gray-700/30 hover:border-secondary/50"
                  aria-label="Twitter"
                >
                  <FaTwitter className="text-xl text-gray-400 group-hover:text-secondary transition-colors duration-300" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ title, description, icon }) => (
  <div className="p-6 rounded-lg bg-background hover:bg-background-dark transition-all duration-200 transform hover:scale-105">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

export default WelcomePage;
