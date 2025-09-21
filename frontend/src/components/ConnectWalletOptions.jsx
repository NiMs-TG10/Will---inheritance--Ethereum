import { useConnect } from 'wagmi'
import WalletOption from './WalletOption'

const ConnectWalletOptions = () => {
  const { connectors, connect } = useConnect()

  return (
    <div className="space-y-4">
      {connectors.map((connector) => (
        <WalletOption
          key={connector.uid}
          connector={connector}
          onClick={() => connect({ connector })}
        />
      ))}
    </div>
  )
}

export default ConnectWalletOptions 