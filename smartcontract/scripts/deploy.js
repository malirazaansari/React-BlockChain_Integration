const hre = require("hardhat");

async function main() {
  const NFTMint = await hre.ethers.getContractFactory("NFTMint"); // Load contract
  const nftMint = await NFTMint.deploy(); // Deploy contract

  await nftMint.waitForDeployment(); // Ensure deployment is completed

  console.log("NFTMint deployed to:", await nftMint.getAddress()); // Print deployed contract address
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
