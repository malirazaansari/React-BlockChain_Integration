import { useState } from "react";
import contract from "./contract";

const App = () => {
  const [userId, setUserId] = useState("");
  const [fileHash, setFileHash] = useState("");
  const [account, setAccount] = useState(null); // State to track connected wallet

  const fetchFileHash = async () => {
    try {
      const hash = await contract.methods.getFileHash(userId).call();
      setFileHash(hash);
    } catch (error) {
      console.error("Error fetching file hash:", error);
    }
  };

  const uploadFileHash = async () => {
    try {
      if (!account) {
        alert("Please connect your wallet first!");
        return;
      }

      await contract.methods
        .uploadFileHash(userId, fileHash)
        .send({ from: account });
      alert("File Hash Uploaded!");
    } catch (error) {
      console.error("Error uploading file hash:", error);
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]); // Set connected account
        console.log("Connected Account:", accounts[0]);
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      alert("MetaMask not found. Please install it.");
    }
  };

  const disconnectWallet = () => {
    setAccount(null); // Clear the account state
    console.log("Wallet disconnected");
  };

  return (
    <div className="p-4">
      <h2 className="font-bold text-xl">File Hash Manager</h2>

      {/* Connect/Disconnect Wallet */}
      {account ? (
        <button
          onClick={disconnectWallet}
          className="bg-red-500 p-2 text-white"
        >
          Disconnect Wallet
        </button>
      ) : (
        <button
          onClick={connectWallet}
          className="bg-green-500 p-2 text-white"
        >
          Connect Wallet
        </button>
      )}
      {account && <p className="mt-2">Connected: {account}</p>}

      {/* Fetch File Hash */}
      <div className="mt-4">
        <h3 className="font-bold">Fetch File Hash</h3>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter User ID"
          className="m-2 p-2 border"
        />
        <button
          onClick={fetchFileHash}
          className="bg-blue-500 p-2 text-white"
        >
          Fetch File Hash
        </button>
        {fileHash && <p className="mt-2">File Hash: {fileHash}</p>}
      </div>

      {/* Upload File Hash */}
      <div className="mt-4">
        <h3 className="font-bold">Upload File Hash</h3>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter User ID"
          className="m-2 p-2 border"
        />
        <input
          type="text"
          value={fileHash}
          onChange={(e) => setFileHash(e.target.value)}
          placeholder="Enter File Hash"
          className="m-2 p-2 border"
        />
        <button
          onClick={uploadFileHash}
          className="bg-purple-500 p-2 text-white"
        >
          Upload File Hash
        </button>
      </div>
    </div>
  );
};

export default App;
