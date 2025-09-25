import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { ethers } from "ethers";
import contractABI from "./contract/NFTMint.json" assert { type: "json" };
import router from "./routes/nftRoutes.js";

const app = express();
app.use(express.json());
app.use(cors());
app.use("/api", router);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_API_KEY);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
console.log("Private Key:", process.env.PRIVATE_KEY);

const contractAddress = "0x126aA9e42d2fE23C0B5306844914f6DDf1bB63bC";
const contract = new ethers.Contract(contractAddress, contractABI.abi, wallet);
console.log("Contract Instance:", contract);

export { contract };

app.use(express.static("./frontend/dist"));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./frontend", "dist", "index.html"));
});

app.listen(5000, () => console.log("Server running on port 5000"));
