import Web3 from "web3";

const getProvider = (network) => {
  switch (network) {
    case "spolia":
      return new Web3.providers.HttpProvider(
        "https://sepolia.infura.io/v3/4abd0512745244c995d31aad9685535c"
      );
    case "binance-test":
      return new Web3.providers.HttpProvider(
        "https://data-seed-prebsc-1-s1.binance.org:8545"
      );
    case "binance-main":
      return new Web3.providers.HttpProvider(
        "https://bsc-dataseed.binance.org/"
      );
    default:
      return new Web3.providers.HttpProvider(
        "https://mainnet.infura.io/v3/4abd0512745244c995d31aad9685535c"
      );
  }
};

const web3 = new Web3(getProvider("mainnet"));

export default web3;
