require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // Load environment variables

module.exports = {
  solidity: "0.8.28", // Adjust to your Solidity version
  networks: {
    sepolia: {
      url: process.env.ALCHEMY_API_KEY, // Sepolia RPC URL
      accounts: [process.env.PRIVATE_KEY], // Private key for deployment
    },
  },
};
