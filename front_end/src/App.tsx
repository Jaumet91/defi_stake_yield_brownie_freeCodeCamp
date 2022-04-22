import React from "react";
import { DAppProvider, Config, Kovan } from "@usedapp/core";
import { Header } from "./components/Header";
import "./App.css";
import { Main } from "./components/Main"
import { getDefaultProvider } from "ethers";

const config: Config = {
  readOnlyChainId: Kovan.chainId,
  readOnlyUrls: { [Kovan.chainId]: getDefaultProvider('kovan'), },
  notifications: {
    expirationPeriod: 1000, //ms -> Every 1s check the blockchain
    checkInterval: 1000
  },
}

function App() {
  return (
    <div className="App">
      <DAppProvider config={config}>
        <Header />
        <Main />
      </DAppProvider>
    </div>
  );
}

export default App;
