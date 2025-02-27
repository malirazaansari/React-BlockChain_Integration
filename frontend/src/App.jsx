import { useEffect, useState, useCallback } from "react";
import { formatEther } from "ethers";
import { BrowserProvider } from "ethers";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Pagination } from 'antd';

const App = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("");
  const [showBalance, setShowBalance] = useState(false);
  const [accountDetails, setAccountDetails] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [nfts, setNfts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;


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

  useEffect(() => {
    fetchNFTs();
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
    setShowBalance((prevShowBalance) => !prevShowBalance);
  };

  const handleShowDetail = () => {
    showCurrentAccount();
    setShowDetail((prevShowDetail) => !prevShowDetail);
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );
      return res.data.secure_url;
    } catch (error) {
      toast.error("Cloudinary upload failed!");
      console.error(error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let finalImageUrl = imageUrl;
    if (image) {
      const cloudinaryUrl = await uploadToCloudinary(image);
      if (!cloudinaryUrl) return;
      finalImageUrl = cloudinaryUrl;
    }

    if (!finalImageUrl) {
      toast.error("Please provide an image or URL");
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/mint`, {
        tokenURI: finalImageUrl,
      });
      console.log("NFT saved:", response.data);
      toast.success("NFT saved successfully!");
      fetchNFTs();
      setImageUrl("");
    } catch (error) {
      toast.error("Failed to save NFT!");
      console.error(error);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isMinting) return; 

    setIsMinting(true);
    try {
      await handleSubmit(e);
    } catch (error) {
      console.error("Minting failed:", error);
    } finally {
      setIsMinting(false);
    }
  };

  const fetchNFTs = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/nfts`);
      setNfts(response.data);
    } catch (error) {
      console.error("Error fetching NFTs", error);
    }
  };

  const indexOfLastNFT = currentPage * pageSize;
  const indexOfFirstNFT = indexOfLastNFT - pageSize;
  const currentNFTs = nfts.slice(indexOfFirstNFT, indexOfLastNFT);

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString(); 
  };
  const shortenHash = (hash) => {
    return hash ? `${hash.substring(0, 15)}...${hash.substring(hash.length - 4)}` : 'N/A';
  };

  return (
  <>
  {/* BlockChain Accounts Connection */}
  <div className="bg-gray-50 p-8">
    <h1 className="mb-8 font-bold text-gray-800 text-3xl text-center">Wallet Integration</h1>

    <div className="flex justify-center mb-6">
      {account ? (
        <button
          onClick={disconnectWallet}
          className="bg-red-500 hover:bg-red-600 shadow-md px-5 py-3 rounded-lg font-semibold text-white transition-all"
        >
          Disconnect Wallet
        </button>
      ) : (
        <button
          onClick={connectWallet}
          className="bg-green-500 hover:bg-green-600 shadow-md px-5 py-3 rounded-lg font-semibold text-white transition-all"
        >
          Connect Wallet
        </button>
      )}
    </div>

    <div className="flex flex-wrap justify-center gap-4 mb-6">
      <button
        onClick={() => switchNetwork("ethereum-mainnet")}
        className="bg-blue-600 hover:bg-blue-700 shadow-md px-4 py-2 rounded-lg font-semibold text-white transition-all"
      >
        Ethereum Mainnet
      </button>
      <button
        onClick={() => switchNetwork("sepolia-testnet")}
        className="bg-blue-600 hover:bg-blue-700 shadow-md px-4 py-2 rounded-lg font-semibold text-white transition-all"
      >
        Sepolia Testnet
      </button>
      <button
        onClick={() => switchNetwork("binance-testnet")}
        className="bg-blue-600 hover:bg-blue-700 shadow-md px-4 py-2 rounded-lg font-semibold text-white transition-all"
      >
        Binance Testnet
      </button>
      <button
        onClick={() => switchNetwork("binance-mainnet")}
        className="bg-blue-600 hover:bg-blue-700 shadow-md px-4 py-2 rounded-lg font-semibold text-white transition-all"
      >
        Binance Mainnet
      </button>
    </div>

    <div className="flex justify-center mb-6">
      <button
        onClick={handleShowBalance}
        className="bg-orange-500 hover:bg-orange-600 shadow-md px-5 py-3 rounded-lg font-semibold text-white transition-all"
      >
        Show Balance
      </button>
    </div>
    {showBalance && (
      <div className="mb-6 text-center">
        <p className="font-semibold text-gray-800 text-xl">Balance: {balance} ETH</p>
      </div>
    )}

    <div className="flex justify-center">
      <button
        onClick={handleShowDetail}
        className="bg-purple-600 hover:bg-purple-700 shadow-md px-5 py-3 rounded-lg font-semibold text-white transition-all"
      >
        Show Account Details
      </button>
    </div>
    {showDetail && (
      <div className="bg-white shadow-lg mt-6 p-4 rounded-lg text-center">
        <p className="font-medium text-gray-700 text-lg whitespace-pre-line">{accountDetails}</p>
      </div>
    )}
  </div>
  {/*NFT Mint*/}
  <div className="bg-gray-900 p-12 min-h-screen text-white">
      <ToastContainer />
      <h1 className="mb-6 font-bold text-4xl text-center">NFT Minting Platform</h1>

      <form onSubmit={onSubmit} className="bg-gray-800 shadow-lg mx-auto p-8 rounded-lg max-w-lg">
        <label className="block mb-3 font-medium text-lg">Upload Image or Enter Image URL:</label>
        <input
          type="text"
          placeholder="Enter image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="bg-gray-700 mb-4 p-3 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
        />
        <button
          type="submit"
          disabled={isMinting}
          className={`p-3 rounded-lg w-full font-semibold text-lg transition-all ${
          isMinting ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 shadow-md"
        }`}
        >
          {isMinting ? "Minting..." : "Mint NFT"}
        </button>
      </form>

      <h2 className="mt-10 mb-6 font-bold text-3xl text-center">Minted NFTs</h2>
      <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
        {currentNFTs.map((nft) => (
          <div key={nft._id} className="bg-gray-800 shadow-lg hover:shadow-xl p-4 rounded-lg transition-all">
            <img src={nft.tokenURI} alt="NFT" className="rounded w-full h-52 object-cover" />
            <p className="mt-3 text-gray-300 text-sm">Token Hash: {shortenHash(nft.txHash)}</p>
            <p className="text-gray-300 text-sm">Minted At: {formatDate(nft.mintedAt)}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-6">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={nfts.length}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
        />
      </div>
  </div>
  </>
  );
};

export default App;