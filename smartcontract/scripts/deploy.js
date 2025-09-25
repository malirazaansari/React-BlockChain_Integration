const hre = require("hardhat");

async function main() {
  const NFTMint = await hre.ethers.getContractFactory("NFTMint");
  const nftMint = await NFTMint.deploy();

  await nftMint.waitForDeployment();

  console.log("NFTMint deployed to:", await nftMint.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
