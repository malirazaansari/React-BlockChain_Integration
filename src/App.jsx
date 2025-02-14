import { useState } from "react";
import contract from "./contract";

const App = () => {
  const [userId, setUserId] = useState("");
  const [fileHash, setFileHash] = useState("");

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
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const sender = accounts[0];

      await contract.methods
        .uploadFileHash(userId, fileHash)
        .send({ from: sender });
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
        console.log("Connected Account:", accounts[0]);
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      alert("MetaMask not found. Please install it.");
    }
  };

  // return (
  //   <div className="p-4">
  //     <h2 className="font-bold text-xl">Get File Hash</h2>
  //     <input
  //       type="text"
  //       value={userId}
  //       onChange={(e) => setUserId(e.target.value)}
  //       placeholder="Enter User ID"
  //       className="m-2 p-2 border"
  //     />
  //     <button
  //       onClick={fetchFileHash}
  //       className="bg-blue-500 p-2 text-white"
  //     >
  //       Fetch File Hash
  //     </button>
  //     {fileHash && <p className="mt-2">File Hash: {fileHash}</p>}
  //     <button
  //       onClick={connectWallet}
  //       className="bg-green-500 p-2 text-white"
  //     >
  //       Connect Wallet
  //     </button>
  //   </div>
  // );
  return (
    <div className="p-4">
      <h2 className="font-bold text-xl">File Hash Manager</h2>

      {/* Connect Wallet */}
      <button
        onClick={connectWallet}
        className="bg-green-500 p-2 text-white"
      >
        Connect Wallet
      </button>

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
