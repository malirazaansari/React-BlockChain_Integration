import { useEffect, useState, useCallback } from "react";
import { formatEther } from "ethers";
import { BrowserProvider } from "ethers";

const App = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("");
  const [showBalance, setShowBalance] = useState(false);
  const [accountDetails, setAccountDetails] = useState("");
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    if (!window.ethereum) {
      console.error("MetaMask not found.");
      return;
    }

    const initializeProvider = async () => {
      try {
        const newProvider = new BrowserProvider(window.ethereum);
        setProvider(newProvider);

        const signerInstance = await newProvider.getSigner();
        setSigner(signerInstance);

        const accounts = await newProvider.listAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          updateBalance(accounts[0], newProvider);
        }
      } catch (error) {
        console.error("Provider Initialization Error:", error);
      }
    };

    initializeProvider();

    const handleNetworkChange = async (chainId) => {
      console.log(`Network changed to: ${parseInt(chainId, 16)}`);

      const newProvider = new BrowserProvider(window.ethereum);
      setProvider(newProvider);

      const accounts = await newProvider.listAccounts();
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        updateBalance(accounts[0], newProvider);
      }
    };

    window.ethereum.on("chainChanged", handleNetworkChange);

    return () => {
      window.ethereum.removeListener("chainChanged", handleNetworkChange);
    };
  }, []);

  const updateBalance = useCallback(async (accountAddress, providerInstance) => {
    if (!providerInstance || !accountAddress) return;

    try {
      console.log(`Fetching balance for account: ${accountAddress}`);

      const network = await providerInstance.getNetwork();
      console.log(`Current Network: ${network.chainId}`);

      await new Promise((resolve) => setTimeout(resolve, 500));

      const newNetwork = await providerInstance.getNetwork();
      if (network.chainId !== newNetwork.chainId) {
        console.warn("Network changed while fetching balance. Retrying...");
        return;
      }

      const balance = await providerInstance.getBalance(accountAddress);
      setBalance(formatEther(balance));

      console.log(`Balance updated: ${formatEther(balance)} ETH`);
    } catch (error) {
      console.error("Error fetching balance:", error.message);
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (!provider || !window.ethereum) return;

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        setAccount(accounts[0].toString());
        updateBalance(accounts[0], provider);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet. Please try again.");
    }
  }, [provider, updateBalance]);

  const disconnectWallet = () => {
    setAccount("");
    setBalance("");
    setShowBalance(false);
    setShowDetail(false);
    console.log("Wallet disconnected");
  };

  const switchNetwork = useCallback(async (network) => {
    if (!window.ethereum) return;

    const networks = {
      "ethereum-mainnet": {
        chainId: "0x1",
        rpcUrls: ["https://mainnet.infura.io/v3/4abd0512745244c995d31aad9685535c"],
        chainName: "Ethereum Mainnet",
        nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
        blockExplorerUrls: ["https://etherscan.io"],
      },
      "sepolia-testnet": {
        chainId: "0xaa36a7",
        rpcUrls: ["https://sepolia.infura.io/v3/4abd0512745244c995d31aad9685535c"],
        chainName: "Sepolia Testnet",
        nativeCurrency: { name: "SepoliaETH", symbol: "SepETH", decimals: 18 },
        blockExplorerUrls: ["https://sepolia.etherscan.io"],
      },
      "binance-testnet": {
        chainId: "0x61",
        rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545"],
        chainName: "Binance Smart Chain Testnet",
        nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
        blockExplorerUrls: ["https://testnet.bscscan.com"],
      },
      "binance-mainnet": {
        chainId: "0x38",
        rpcUrls: ["https://bsc-dataseed.binance.org/"],
        chainName: "Binance Smart Chain Mainnet",
        nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
        blockExplorerUrls: ["https://bscscan.com"],
      },
    };

    if (!networks[network]) {
      alert("Invalid network selected.");
      return;
    }

    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [networks[network]],
      });

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        updateBalance(accounts[0], provider);
        setShowBalance(false);
        setShowDetail(false);
      }
    } catch (error) {
      console.error("Error switching network:", error);
      alert("Failed to switch network. Please try again.");
    }
  }, [provider, updateBalance]);

  const showCurrentAccount = useCallback(async () => {
    if (!provider) return;

    try {
      const accounts = await provider.listAccounts();
      const network = await provider.getNetwork();
      if (accounts.length > 0) {
        setAccountDetails(`Current Network: ${network.name}`);
      } else {
        setAccountDetails("No account connected.");
      }
    } catch (error) {
      console.error("Error fetching current account:", error);
    }
  }, [provider]);

  const handleShowBalance = () => {
    // setShowBalance(true);
    setShowBalance((prevShowBalance) => !prevShowBalance);
  };

  const handleShowDetail = () => {
    showCurrentAccount();
    setShowDetail((prevShowDetail) => !prevShowDetail);
    // setShowDetail(true);
  };

  return (
    <div className="p-4">
      <h1 className="font-bold text-xl">Wallet Integration</h1>

      {account ? (
        <button onClick={disconnectWallet} className="bg-red-500 p-2 text-white">
          Disconnect Wallet
        </button>
      ) : (
        <button onClick={connectWallet} className="bg-green-500 p-2 text-white">
          Connect Wallet
        </button>
      )}

      <div className="space-x-2 mt-4">
        <button onClick={() => switchNetwork("ethereum-mainnet")} className="bg-blue-500 p-2 text-white">
          Switch to Ethereum Mainnet
        </button>
        <button onClick={() => switchNetwork("sepolia-testnet")} className="bg-blue-500 p-2 text-white">
          Switch to Sepolia Testnet
        </button>
        <button onClick={() => switchNetwork("binance-testnet")} className="bg-blue-500 p-2 text-white">
          Switch to Binance Testnet
        </button>
        <button onClick={() => switchNetwork("binance-mainnet")} className="bg-blue-500 p-2 text-white">
          Switch to Binance Mainnet
        </button>
      </div>

      <button onClick={handleShowBalance} className="bg-orange-500 mt-2 p-2 text-white">
        Show Balance
      </button>
      {showBalance && (
        <p className="mt-2">Balance: {balance} ETH</p>
      )}

      <div className="mt-4">
        <button onClick={handleShowDetail} className="bg-purple-500 p-2 text-white">
          Show Current Account Details
        </button>
        {showDetail && (
          <p className="mt-2 whitespace-pre-line">{accountDetails}</p>
        )}
      </div>
    </div>
  );
};

export default App;