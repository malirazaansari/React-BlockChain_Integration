import mongoose from "mongoose";

const NFTSchema = new mongoose.Schema({
  recipient: String,
  tokenURI: String,
  txHash: String,
  mintedAt: { type: Date, default: Date.now },
});

const NFT = mongoose.model("NFT", NFTSchema);

export default NFT;
