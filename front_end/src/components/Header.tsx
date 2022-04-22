import { useEthers } from "@usedapp/core";
import "../stylesheet/Header.css"

export const Header = () => {
  const { account, activateBrowserWallet, deactivate } = useEthers()

  const isConnected = account !== undefined

  return (
    <div className="header-container">
      {isConnected ? (
        <button
          className="button-deactivate"
          onClick={deactivate}>
          Disconnect
        </button>
      ) : (
        <button
          className="button-connect"
          onClick={activateBrowserWallet}>
          Connect
        </button>
      )
      }
    </div>
  )
}