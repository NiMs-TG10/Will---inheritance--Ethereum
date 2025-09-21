import { useEffect, useState } from 'react'

const WalletOption = ({ connector, onClick }) => {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const checkProvider = async () => {
      try {
        const provider = await connector.getProvider()
        setReady(!!provider)
      } catch (error) {
        setReady(false)
      }
    }
    
    checkProvider()
  }, [connector])

  return (
    <button
      disabled={!ready}
      onClick={onClick}
      className={`w-full p-4 rounded-lg flex items-center justify-between transition-all duration-200
        ${ready 
          ? 'bg-background hover:bg-background-dark text-white cursor-pointer' 
          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
        }`}
    >
      <span className="font-medium">{connector.name}</span>
      {!ready && <span className="text-sm">Install Wallet</span>}
    </button>
  )
}

export default WalletOption 