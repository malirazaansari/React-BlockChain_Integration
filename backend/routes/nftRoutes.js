import express from "express";
import NFT from "../models/nftModel.js";
import { ethers } from "ethers";
import { contract } from "../server.js"; 

const router = express.Router();

router.post("/mint", async (req, res) => {
  try {
    const { tokenURI } = req.body;
    if (!contract) {
      throw new Error("Contract is not initialized!");
    }
    if (!tokenURI) return res.status(400).json({ error: "tokenURI is required" });

    const tx = await contract.mintNFT(tokenURI);
    await tx.wait();

    const newNFT = new NFT({    
        tokenURI: tokenURI,
        tokenId: Math.floor(Math.random() * 100000),
        owner: "0xUserWalletAddress",
        txHash: tx.hash });
    await newNFT.save();

    res.json({ message: "NFT Minted and saved to DB!", txHash: tx.hash });
  } catch (error) {
    console.error("Minting Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get("/nfts", async (req, res) => {
    try {
      const nfts = await NFT.find();
      res.json(nfts);
    } catch (error) {
      res.status(500).json({ error: "Error fetching NFTs" });
    }
  });

export default router;
